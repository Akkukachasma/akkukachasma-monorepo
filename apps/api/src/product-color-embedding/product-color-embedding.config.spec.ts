import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductColorEmbeddingConfigService } from './product-color-embedding.config';

describe('ProductColorEmbeddingConfigService', () => {
  const createService = (env: Record<string, string>) => {
    const config = {
      get: jest.fn((key: string, defaultValue?: string) =>
        env[key] ?? defaultValue,
      ),
    };
    return new ProductColorEmbeddingConfigService(
      config as unknown as ConfigService,
    );
  };

  it('defaults maxPerProductColor to 5', () => {
    const service = createService({});
    expect(service.maxPerProductColor).toBe(5);
  });

  it('reads PRODUCT_COLOR_MAX_EMBEDDINGS from config', () => {
    const service = createService({ PRODUCT_COLOR_MAX_EMBEDDINGS: '8' });
    expect(service.maxPerProductColor).toBe(8);
  });

  it('falls back when env value is invalid', () => {
    const service = createService({ PRODUCT_COLOR_MAX_EMBEDDINGS: 'nope' });
    expect(service.maxPerProductColor).toBe(5);
  });
});
