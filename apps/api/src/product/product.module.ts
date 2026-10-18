import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { ProductService } from './product.service';
import { ProductColorModule } from './product-color/product-color.module';
import { WishlistModule } from '../wishlist/wishlist.module';
import { PopularityModule } from '../popularity/popularity.module';
import { ProductColorEmbeddingModule } from '../product-color-embedding/product-color-embedding.module';
import { NotificationModule } from '../notifications/notifications.module';
import { ProductPriceAdjustmentService } from './product-price-adjustment.service';

@Module({
  imports: [
    ProductColorModule,
    WishlistModule,
    PopularityModule,
    ProductColorEmbeddingModule,
    NotificationModule,
  ],
  controllers: [ProductController],
  providers: [
    PrismaService,
    FileService,
    BucketService,
    ProductService,
    ProductPriceAdjustmentService,
  ],
  exports: [ProductService],
})
export class ProductModule {}
