import { Test, TestingModule } from '@nestjs/testing';
import { HeroMediaController } from './hero-media.controller';
import { HeroMediaService } from './hero-media.service';
import { REQUIRE_PERMISSIONS_KEY } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/constants';

describe('HeroMediaController', () => {
  let controller: HeroMediaController;
  const heroMedia = {
    getActiveMetadata: jest.fn(),
    pipeActiveVideoToResponse: jest.fn(),
    pipeFileToResponse: jest.fn(),
    activateFromCompletedUpload: jest.fn(),
    listAll: jest.fn(),
    removeHeroEntry: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeroMediaController],
      providers: [{ provide: HeroMediaService, useValue: heroMedia }],
    }).compile();

    controller = module.get(HeroMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('guards activate and delete with hero-media:manage', () => {
    const manage = PERMISSIONS.HERO_MEDIA_MANAGE;
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.activate),
    ).toEqual(expect.arrayContaining([manage]));
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.adminRemove),
    ).toEqual(expect.arrayContaining([manage]));
  });

  it('guards admin list with hero-media:view', () => {
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.adminList),
    ).toEqual(expect.arrayContaining([PERMISSIONS.HERO_MEDIA_VIEW]));
  });

  it('does not require permissions on public stream endpoints', () => {
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.getActive),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.streamVideo),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, controller.streamFile),
    ).toBeUndefined();
  });
});
