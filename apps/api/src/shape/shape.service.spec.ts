import { Test, TestingModule } from '@nestjs/testing';
import { ShapeService } from './shape.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ShapeService', () => {
  let service: ShapeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShapeService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ShapeService>(ShapeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
