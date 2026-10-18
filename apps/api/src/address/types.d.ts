import { IWithTransactionClient } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressLabel } from '@prisma/client';

interface ICreate extends IWithTransactionClient {
  user_id: string;
  createAddressDto: CreateAddressDto;
}

interface IUpdate extends IWithTransactionClient {
  address_id: string;
  updateAddressDto: UpdateAddressDto;
}

interface IRemove extends IWithTransactionClient {
  address_id: string;
}

interface IFindOneByLabel {
  user_id: string;
  label: AddressLabel;
  /**
   * @property If supplied, address with this id will not be fetched.
   */
  address_id?: string;
}

interface ICreateAddressFromPincode extends IWithTransactionClient {
  pincode: string;
  address?: string;
}