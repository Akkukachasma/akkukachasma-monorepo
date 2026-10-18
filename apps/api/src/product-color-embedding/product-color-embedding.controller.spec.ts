import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorEmbeddingController } from './product-color-embedding.controller';
import { ProductColorEmbeddingService } from './product-color-embedding.service';
import { REQUIRE_PERMISSIONS_KEY } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/constants';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('ProductColorEmbeddingController', () => {
  let controller: ProductColorEmbeddingController;
  const embeddings = {
    listByProductColor: jest.fn(),
    pipeVideoStream: jest.fn(),
    create: jest.fn(),
    reorder: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductColorEmbeddingController],
      providers: [
        { provide: ProductColorEmbeddingService, useValue: embeddings },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProductColorEmbeddingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('guards admin mutations with product-embedding:manage', () => {
    const manage = PERMISSIONS.PRODUCT_EMBEDDING_MANAGE;
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.create),
    ).toEqual(expect.arrayContaining([manage]));
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.reorder),
    ).toEqual(expect.arrayContaining([manage]));
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.update),
    ).toEqual(expect.arrayContaining([manage]));
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.remove),
    ).toEqual(expect.arrayContaining([manage]));
  });

  it('does not require permissions on public list endpoint', () => {
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.listByProductColor),
    ).toBeUndefined();
  });
});
