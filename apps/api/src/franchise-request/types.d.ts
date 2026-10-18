import { Prisma } from "@prisma/client";
import { PaginateQueryDto } from "../prisma/dto/paginate.dto";

interface IFindAll extends PaginateQueryDto {
  filters: Prisma.FranchiseRequestWhereInput;
  sort_by?: string;
}