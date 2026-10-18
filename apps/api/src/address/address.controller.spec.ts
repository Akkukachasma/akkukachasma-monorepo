import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { PincodeService } from './pincode.service';
import { PrismaService } from '../prisma/prisma.service';
import { DelhiveryService } from '../delhivery/delhivery.service';

describe('AddressController', () => {
  let controller: AddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        AddressService,
        { provide: PrismaService, useValue: {} },
        { provide: PincodeService, useValue: {} },
        {
          provide: DelhiveryService,
          useValue: {
            assertPincodeDeliverable: jest.fn(),
            checkPincodeServiceability: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AddressController>(AddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
