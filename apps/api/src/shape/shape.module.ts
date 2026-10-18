import { Module } from '@nestjs/common';
import { ShapeService } from './shape.service';
import { ShapeController } from './shape.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { ProductService } from '../product/product.service';
import { WishlistModule } from '../wishlist/wishlist.module';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [WishlistModule, NotificationModule],
  controllers: [ShapeController],
  providers: [
    ShapeService,
    PrismaService,
    BucketService,
    FileService,
    ProductService,
  ],
})
export class ShapeModule {}
