import { Module } from '@nestjs/common';
import { TryAtHomeService } from './tryathome.service';
import { TryAtHomeController } from './tryathome.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PincodeService } from '../address/pincode.service';
import { AddressService } from '../address/address.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [TryAtHomeController],
  providers: [TryAtHomeService, PincodeService, AddressService],
})
export class TryAtHomeModule {} 