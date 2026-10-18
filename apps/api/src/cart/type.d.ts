import { IWithTransactionClient } from '../prisma/prisma.service';
import { AddProductToCartDto } from './dto/add-product.dto';
import {
  CartItem,
  Color,
  Coupon,
  File,
  LensDetail,
  LensFeature,
  PowerType,
  Prescription,
  Product,
  ProductColor,
} from '@prisma/client';
import {
  IOrderLensDetail,
  IOrderLensFeature,
  IOrderPowerType,
} from '../order/types';

interface ICreateCart extends IWithTransactionClient {
  user_id: string;
}

interface ICreateCartGuest extends IWithTransactionClient {
  temp_session_id: string;
}

interface IRemoveCouponFromCart extends IWithTransactionClient {
  cart_id: string;
  /**
   * When true, disconnect without restoring coupon.quantity (order placed / confirmed).
   * When false/omitted, restore quantity if this cart had locked a unit.
   */
  confirm?: boolean;
}

interface IRemoveProductFromCart extends IWithTransactionClient {
  cart_item_id: string;
}

interface IAddProductToCart extends IWithTransactionClient {
  addProductToCartDto: Omit<AddProductToCartDto, 'save_prescription'>;
  cart_id: string;
}
interface IAddCouponToCart extends IWithTransactionClient {
  cart_id: string;
  coupon_id: string;
}

interface IProductIsInCart extends IWithTransactionClient {
  product_color_id: string;
  cart_id: string;
  lens_feature_id: string;
  lens_detail_id: string;
  power_type_id: string;
}

interface IFindCartItem {
  cart_item_id: string;
}

interface IFindAllItems {
  cart_id: string;
}

interface IPrescription extends Partial<Prescription> {
  image?: string | File; // string when the prescription is not hydrated with image. Remember parsed but not hydrated with imgae file, then it will be containing just the id of the file in imgae field.
}

interface ICartItem extends Partial<CartItem> {
  frame_only: boolean;
  quantity: number;
  prescription: IPrescription;
  lens_feature: IOrderLensFeature;
  power_type: IOrderPowerType;
  lens_detail: IOrderLensDetail;
  product_color: Partial<ProductColor> & {
    colors: Partial<Color>[];
    product: Partial<Product>;
    images: Partial<File>[];
  };
  price: number;
}

interface ICalculation {
  base_subtotal: number;
  subtotal: number;
  discount_on_mrp: number;
  lens_detail_price: number;
  shipping_price: number;
  total: number;
  total_gst?: number;
  total_other_taxes?: number;
  gst_breakdown?: {
    total_gst: number;
    cgst: number;
    sgst: number;
    igst: number;
    /** Paise; + rounded down, − rounded up (invoice transparency). */
    rounded_by?: number;
  };
  applied_coupon?: {
    coupon: Coupon | null;
    discount: number;
  };
}
