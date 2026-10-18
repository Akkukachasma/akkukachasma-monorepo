import {
  Coupon,
  LensDetail,
  OrderItem,
  OrderItemTax,
  Prisma,
} from '@prisma/client';
import { ICartItem } from '../cart/type';
import { IWithTransactionClient } from '../prisma/prisma.service';
import { UpdateOrderPaymentModeDto } from './dto/update-order.dto';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface IOrderProductColor {
  id: string;
  thumbnail: string;
  model_number: string;
  color: Array<{ color: string; name: string }>;
}

interface IOrderPowerType extends Partial<LensDetail> {}

interface IOrderLensFeature extends Partial<LensDetail> {}

interface IOrderLensDetail extends Partial<LensDetail> {}

interface ICreateOrder extends IWithTransactionClient {
  user_id: string;
  cart_items: ICartItem[];
  coupon?: Coupon;
  source?: 'cart' | 'direct';
}

interface ICreateOrderPricing extends IWithTransactionClient {
  order_id: string;
  order_items: IOrderItem[];
  coupon?: Coupon;
}

interface IUpdateCouponUsage extends IWithTransactionClient {
  coupon_id: string;
  user_id: string;
}

interface IUpdateOrderPaymentMode extends IWithTransactionClient {
  order_id: string;
  updateOrderPaymentModeDto: UpdateOrderPaymentModeDto;
}

interface IUpdatePricing extends IWithTransactionClient {
  order_id: string;
  data: Prisma.OrderPricingUpdateInput;
}

interface IUpdateOrderAddress extends IWithTransactionClient {
  order_id: string;
  address_id: string;
}

interface IGetPaybleOrder {
  order_id: string;
  user_id: string;
}

interface IGetPaybleOrder {
  order_id: string;
  user_id: string;
}

interface IUpdateOrder extends IWithTransactionClient {
  order_id: string;
  data: Prisma.OrderUpdateInput;
}

interface IOrderItem extends Partial<OrderItem> {
  taxes: Array<Partial<OrderItemTax>>;
}

interface IUpdateOrderItemsDiscount {
  order_items: IOrderItem[];
  coupon?: Coupon | null;
  /**
   * in case of coupon update...
   */
  coupon_code?: string;
  prisma?: PrismaClient;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.OrderWhereInput;
  sort_by?: string;
}

interface ICount {
  filters?: Prisma.OrderWhereInput;
}
