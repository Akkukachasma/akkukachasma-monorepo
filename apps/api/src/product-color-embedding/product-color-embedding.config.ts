import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductColorEmbeddingConfigService {
  constructor(private readonly config: ConfigService) {}

  get maxPerProductColor(): number {
    const raw = this.config.get<string>('PRODUCT_COLOR_MAX_EMBEDDINGS', '5');
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 5;
  }
}
