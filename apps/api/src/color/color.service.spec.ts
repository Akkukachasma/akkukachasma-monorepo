import { Test, TestingModule } from '@nestjs/testing';
import { ColorService } from './color.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColorService', () => {
  let service: ColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColorService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ColorService>(ColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
