import { Test, TestingModule } from '@nestjs/testing';
import { PowerTypeService } from './power-type.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PowerTypeService', () => {
  let service: PowerTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PowerTypeService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PowerTypeService>(PowerTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
