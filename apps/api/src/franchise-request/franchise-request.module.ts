import { Module } from '@nestjs/common';
import { FranchiseRequestService } from './franchise-request.service';
import { FranchiseRequestController } from './franchise-request.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AddressService } from '../address/address.service';
import { PincodeService } from '../address/pincode.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [FranchiseRequestController],
  providers: [FranchiseRequestService, PrismaService, AddressService, PincodeService],
})
export class FranchiseRequestModule {} 