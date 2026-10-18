import { Module, OnModuleInit } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { PrismaService } from '../prisma/prisma.service';
import { PincodeService } from './pincode.service';
import { DelhiveryModule } from '../delhivery/delhivery.module';
import {
  IsCityValidForPincodeConstraint,
  IsStateValidForPincodeConstraint,
  IsValidPincodeConstraint,
  IsAddressValidForPincodeConstraint,
  setGlobalPincodeService,
} from './validators/pincode.validator';

@Module({
  imports: [DelhiveryModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    PrismaService,
    PincodeService,
    IsValidPincodeConstraint,
    IsCityValidForPincodeConstraint,
    IsStateValidForPincodeConstraint,
    IsAddressValidForPincodeConstraint,
  ],
})
export class AddressModule implements OnModuleInit {
  constructor(private readonly pincodeService: PincodeService) {}

  onModuleInit() {
    // Set the global pincode service instance for validators
    setGlobalPincodeService(this.pincodeService);
  }
}
