import { Prisma } from "@prisma/client";
import { PaginateQueryDto } from "../prisma/dto/paginate.dto";
import { IWithTransactionClient } from "../prisma/prisma.service";
import { CreateTryAtHomeDto } from "./dto/create-tryathome.dto";

interface IListRequests extends PaginateQueryDto {
    filters: Prisma.TryAtHomeWhereInput;
    sort_by: string;
}
interface ICreateRequest extends IWithTransactionClient {
    address_id: string;
    data: CreateTryAtHomeDto;
}