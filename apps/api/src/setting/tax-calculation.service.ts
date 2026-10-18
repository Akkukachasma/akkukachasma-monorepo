import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PincodeService } from '../address/pincode.service';
import { CacheService } from '../cache/cache.service';
import { invoiceTaxKeys } from './invoice-tax/invoice-tax.keys';

const INVOICE_TAX_CACHE_TTL_SECONDS = 600;

export interface TaxBreakdown {
  cgst?: number;
  sgst?: number;
  igst?: number;
  other_tax?: number;
  total_tax: number;
}

export interface ItemTaxCalculation {
  item_id: string;
  category_id?: string;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  tax_breakdown: TaxBreakdown;
  final_price: number;
}

export interface OrderTaxCalculation {
  items: ItemTaxCalculation[];
  subtotal: number;
  total_discount: number;
  total_tax: number;
  delivery_charge: number;
  final_total: number;
  tax_details: {
    cgst_total: number;
    sgst_total: number;
    igst_total: number;
    other_tax_total: number;
  };
}

@Injectable()
export class TaxCalculationService {
  private readonly logger = new Logger(TaxCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pincodeService: PincodeService,
    private readonly cache: CacheService,
  ) {}

  /** Truncate to 2 decimals (strip); do not round GST up. */
  private stripCurrency(value: number): number {
    const v = Number(value) || 0;
    const sign = v < 0 ? -1 : 1;
    const abs = Math.abs(v);
    return sign * (Math.floor(abs * 100 + 1e-9) / 100);
  }

  /**
   * Check if delivery address is in UP (Uttar Pradesh)
   */
  private isDeliveryInUP(pincode: string): boolean {
    try {
      const pincodeData = this.pincodeService.getPincodeData(pincode);
      return pincodeData.some(data => 
        data.State.toLowerCase() === 'uttar pradesh' || 
        data.State.toLowerCase() === 'up'
      );
    } catch (error) {
      console.error('Error checking UP delivery:', error);
      return false; // Default to inter-state (IGST)
    }
  }

  /**
   * Get applicable taxes for a category
   */
  private async getApplicableTaxes(category_id?: string): Promise<any[]> {
    const cacheKey = category_id
      ? invoiceTaxKeys.byCategory(category_id)
      : invoiceTaxKeys.general();

    const cached = await this.cache.get<any[]>(cacheKey);
    if (cached !== null) {
      if (Array.isArray(cached)) return cached;
      await this.cache.del(cacheKey);
    }

    try {
      let rows: any[];
      if (category_id) {
        rows = await this.prisma.invoiceTax.findMany({
          where: {
            category_ids: {
              has: category_id,
            },
          },
        });
      } else {
        rows = await this.prisma.invoiceTax.findMany({
          where: {
            category_ids: {
              isEmpty: true,
            },
          },
        });
      }
      await this.cache.set(cacheKey, rows, INVOICE_TAX_CACHE_TTL_SECONDS);
      return rows;
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching applicable taxes from DB',
        error instanceof Error ? error.stack : String(error),
      );
      return [];
    }
  }

  /**
   * Calculate GST breakdown (CGST, SGST, IGST)
   */
  private calculateGSTBreakdown(
    taxable_amount: number,
    gst_percentage: number,
    isIntraState: boolean
  ): TaxBreakdown {
    const total_gst_amount = this.stripCurrency(
      taxable_amount * (gst_percentage / 100),
    );

    if (isIntraState) {
      // Intra-state: Split into CGST and SGST (50% each, truncated)
      const half_gst = this.stripCurrency(total_gst_amount / 2);
      return {
        cgst: half_gst,
        sgst: this.stripCurrency(total_gst_amount - half_gst),
        total_tax: total_gst_amount,
      };
    } else {
      // Inter-state: Apply as IGST
      return {
        igst: total_gst_amount,
        total_tax: total_gst_amount
      };
    }
  }

  /**
   * Calculate tax for a single item
   */
  private async calculateItemTax(
    item: any,
    discount_percentage: number,
    isIntraState: boolean
  ): Promise<ItemTaxCalculation> {
    const subtotal = item.product_color.product.price + (item.lens_detail?.price || 0);
    const discount_amount = this.stripCurrency(
      subtotal * (discount_percentage / 100),
    );
    const taxable_amount = subtotal - discount_amount;

    // Get applicable taxes
    const applicableTaxes = await this.getApplicableTaxes(item.product_color.product.category_id);
    
    let taxBreakdown: TaxBreakdown = {
      total_tax: 0
    };

    // Apply each tax
    for (const tax of applicableTaxes) {
      if (tax.type === 'GST') {
        const gstBreakdown = this.calculateGSTBreakdown(taxable_amount, tax.percentage, isIntraState);
        taxBreakdown = {
          ...taxBreakdown,
          cgst: (taxBreakdown.cgst || 0) + (gstBreakdown.cgst || 0),
          sgst: (taxBreakdown.sgst || 0) + (gstBreakdown.sgst || 0),
          igst: (taxBreakdown.igst || 0) + (gstBreakdown.igst || 0),
          total_tax: taxBreakdown.total_tax + gstBreakdown.total_tax
        };
      } else {
        // Other tax types (VAT, OTHER)
        const otherTaxAmount = this.stripCurrency(
          taxable_amount * (tax.percentage / 100),
        );
        taxBreakdown.other_tax = (taxBreakdown.other_tax || 0) + otherTaxAmount;
        taxBreakdown.total_tax += otherTaxAmount;
      }
    }

    const final_price = taxable_amount + taxBreakdown.total_tax;

    return {
      item_id: item.id,
      category_id: item.product_color.product.category_id,
      subtotal,
      discount_amount,
      taxable_amount,
      tax_breakdown: taxBreakdown,
      final_price
    };
  }

  /**
   * Calculate delivery charge based on payment mode
   */
  private calculateDeliveryCharge(payment_mode: string): number {
    return payment_mode === 'cod' ? 70 : 0;
  }

  /**
   * Calculate total tax for an order
   */
  async calculateOrderTax(
    items: any[],
    coupon: any,
    delivery_pincode: string,
    payment_mode: string
  ): Promise<OrderTaxCalculation> {
    const isIntraState = this.isDeliveryInUP(delivery_pincode);
    
    // Calculate discount percentage from coupon
    let discount_percentage = 0;
    let fixed_discount = 0;
    
    if (coupon) {
      if (coupon.discount_type === 'PERCENTAGE') {
        discount_percentage = coupon.discount_value;
      } else {
        fixed_discount = coupon.discount_value;
      }
    }

    // Calculate item-wise taxes
    const itemCalculations: ItemTaxCalculation[] = [];
    let total_subtotal = 0;
    let total_discount = 0;

    for (const item of items) {
      const itemCalculation = await this.calculateItemTax(item, discount_percentage, isIntraState);
      
      // Apply fixed discount if applicable
      if (fixed_discount > 0) {
        const itemShare = this.stripCurrency(fixed_discount / items.length);
        itemCalculation.discount_amount += itemShare;
        itemCalculation.taxable_amount -= itemShare;
        itemCalculation.final_price -= itemShare;
        total_discount += itemShare;
      } else {
        total_discount += itemCalculation.discount_amount;
      }

      total_subtotal += itemCalculation.subtotal;
      itemCalculations.push(itemCalculation);
    }

    // Calculate delivery charge
    const delivery_charge = this.calculateDeliveryCharge(payment_mode);

    // Sum up all taxes
    const taxDetails = {
      cgst_total: 0,
      sgst_total: 0,
      igst_total: 0,
      other_tax_total: 0
    };

    let total_tax = 0;

    for (const item of itemCalculations) {
      taxDetails.cgst_total += item.tax_breakdown.cgst || 0;
      taxDetails.sgst_total += item.tax_breakdown.sgst || 0;
      taxDetails.igst_total += item.tax_breakdown.igst || 0;
      taxDetails.other_tax_total += item.tax_breakdown.other_tax || 0;
      total_tax += item.tax_breakdown.total_tax;
    }

    const final_total = total_subtotal - total_discount + total_tax + delivery_charge;

    return {
      items: itemCalculations,
      subtotal: total_subtotal,
      total_discount,
      total_tax,
      delivery_charge,
      final_total,
      tax_details: taxDetails
    };
  }

  /**
   * Calculate tax for cart items
   */
  async calculateCartTax(
    cartItems: any[],
    coupon: any,
    delivery_pincode: string,
    payment_mode: string = 'online'
  ): Promise<OrderTaxCalculation> {
    return await this.calculateOrderTax(cartItems, coupon, delivery_pincode, payment_mode);
  }
} 