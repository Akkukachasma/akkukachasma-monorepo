import { Test, TestingModule } from '@nestjs/testing';
import { ColorController } from './color.controller';
import { ColorService } from './color.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColorController', () => {
  let controller: ColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColorController],
      providers: [
        ColorService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ColorController>(ColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
