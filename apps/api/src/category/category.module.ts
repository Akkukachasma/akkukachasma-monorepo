import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { ProductService } from '../product/product.service';
import { WishlistModule } from '../wishlist/wishlist.module';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [WishlistModule, NotificationModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    PrismaService,
    FileService,
    BucketService,
    ProductService,
  ],
})
export class CategoryModule {}
