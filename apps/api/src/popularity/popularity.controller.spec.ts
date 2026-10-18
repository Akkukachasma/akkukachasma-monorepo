import { Test, TestingModule } from '@nestjs/testing';
import { PopularityController } from './popularity.controller';
import { PopularityService } from './popularity.service';

describe('PopularityController', () => {
  let controller: PopularityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopularityController],
      providers: [
        { provide: PopularityService, useValue: { recordShare: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PopularityController>(PopularityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
