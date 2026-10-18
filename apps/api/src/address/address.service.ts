import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICreate, ICreateAddressFromPincode, IFindOneByLabel, IRemove, IUpdate } from './types';
import { PincodeService } from './pincode.service';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService, private readonly pincodeService: PincodeService) {}

  async findOneByLabel({ label, address_id, user_id }: IFindOneByLabel) {
    return await this.prisma.address.findFirst({
      where: {
        label,
        user_id,
        ...(address_id && { id: { not: address_id } }),
      },
    });
  }

  async findOne(address_id: string) {
    return await this.prisma.address.findUnique({
      where: {
        id: address_id,
      },
    });
  }

  async findAll(user_id: string) {
    return await this.prisma.address.findMany({
      where: {
        user_id,
      },
    });
  }

  async create({ createAddressDto, user_id, prisma = this.prisma }: ICreate) {
    const { acknowledge_unverified_pincode: _ack, ...addressData } =
      createAddressDto;
    return await prisma.address.create({
      data: {
        ...addressData,
        user: {
          connect: { id: user_id },
        },
      },
    });
  }

  async update({
    updateAddressDto,
    address_id,
    prisma = this.prisma,
  }: IUpdate) {
    const { acknowledge_unverified_pincode: _ack, ...addressData } =
      updateAddressDto;
    return await prisma.address.update({
      where: {
        id: address_id,
      },
      data: {
        ...addressData,
      },
    });
  }

  async remove({ address_id, prisma = this.prisma }: IRemove) {
    return await prisma.address.delete({
      where: {
        id: address_id,
      },
    });
  }

  async isUserAddress(user_id: string, address_id: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: address_id,
        user_id,
      },
    });
    return address;
  }

  async createAddressFromPincode({pincode, address: address_string, prisma = this.prisma}: ICreateAddressFromPincode){
    // Lookup address info by pincode
    const pincodeData = this.pincodeService.getPincodeData(pincode);
    if (!pincodeData.length) {
      throw new BadRequestException('Invalid pincode.');
    }
    const { City: city, State: state, District: district } = pincodeData[0];
    // Create address with label 'other'
    const address = await prisma.address.create({
      data: {
        label: 'other',
        address: address_string || district,
        state,
        city,
        zip_code: pincode,
        country: 'India',
      },
    });
    return address;
  }
}
