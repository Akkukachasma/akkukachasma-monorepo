import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { IWithTransactionClient } from '../prisma/prisma.service';
interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.CouponWhereInput;
  sort_by?: string;
}
interface IValidCoupon extends IWithTransactionClient {
  coupon_id?: string;
  coupon_code?: string;
  order_value: number;
  user_id?: string;
  /** When true, skip quantity pool check (cart already holds a reserved unit). */
  skip_quantity?: boolean;
}

interface IFindAllAvailableCoupon extends IFindAll {}
interface IFindCouponByCode {
  coupon_code: string;
}
