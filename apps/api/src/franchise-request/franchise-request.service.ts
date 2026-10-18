import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressService } from '../address/address.service';
import { PincodeService } from '../address/pincode.service';
import { CreateFranchiseRequestDto } from './dto/create-franchise-request.dto';
import { GetFranchiseRequestDto } from './dto/get-franchise-request.dto';
import { Nearby, Owner, Prisma } from '@prisma/client';
import { IFindAll } from './types';

@Injectable()
export class FranchiseRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addressService: AddressService,
    private readonly pincodeService: PincodeService,
  ) {}

  async create(createDto: CreateFranchiseRequestDto) {
    // Check for duplicate email
    const exists = await this.prisma.franchiseRequest.findUnique({ where: { email: createDto.email } });
    if (exists) {
      throw new BadRequestException('A franchise request with this email already exists.');
    }
    // Lookup address info by pincode
    const pincodeData = this.pincodeService.getPincodeData(createDto.pincode);
    if (!pincodeData.length) {
      throw new BadRequestException('Invalid pincode.');
    }
    const { City: city, State: state, District: district } = pincodeData[0];
    // Create address with label 'other'
    const address = await this.prisma.address.create({
      data: {
        label: 'other',
        address: district,
        state,
        city,
        zip_code: createDto.pincode,
        country: 'India',
      },
    });
    const other_owner =
      createDto.owner === Owner.other ? createDto.other_owner : undefined;
    const other_near_by =
      createDto.nearby === Nearby.other ? createDto.other_near_by : undefined;

    return await this.prisma.franchiseRequest.create({
      data: {
        name: createDto.name,
        email: createDto.email,
        phone_number: createDto.phone_number,
        address: { connect: { id: address.id } },
        owner: createDto.owner,
        other_owner,
        nearby: createDto.nearby,
        other_near_by,
        message: createDto.message,
      },
      include: { address: true },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const orderBy = (() => {
      switch (sort_by) {
        case 'created_asc':
          return [{ created_at: 'asc' as const }];
        case 'created_desc':
          return [{ created_at: 'desc' as const }];
        case 'name_asc':
          return [{ name: 'asc' as const }];
        case 'name_desc':
          return [{ name: 'desc' as const }];
        case 'recently_updated':
          return [{ updated_at: 'desc' as const }];
        default:
          return [{ created_at: 'desc' as const }];
      }
    })();

    const data = await this.prisma.franchiseRequest.findMany({
      where: filters,
      skip: (page - 1) * page_size,
      take: page_size,
      orderBy,
      include: { address: true },
    });
    return data;
  }

  async approve(id: string) {
    const request = await this.prisma.franchiseRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new BadRequestException('Franchise request not found');
    }
    if (request.status !== 'pending') {
      throw new BadRequestException('Only pending franchise requests can be approved');
    }
    return await this.prisma.franchiseRequest.update({
      where: { id },
      data: { status: 'approved' },
      include: { address: true },
    });
  }

  async count(filters: Prisma.FranchiseRequestWhereInput) {
    return await this.prisma.franchiseRequest.count({ where: filters });
  }

  async remove(id: string) {
    // Remove franchise request and its address
    const request = await this.prisma.franchiseRequest.findUnique({ where: { id }, include: { address: true } });
    if (!request) throw new BadRequestException('Franchise request not found');
    if (request.address) {
      await this.prisma.address.delete({ where: { id: request.address.id } });
    }
    await this.prisma.franchiseRequest.delete({ where: { id } });
    return { success: true };
  }
} 