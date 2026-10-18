import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { ProductModule } from '../product/product.module';
import { WishlistModule } from '../wishlist/wishlist.module';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [ProductModule, WishlistModule, NotificationModule],
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService, BucketService, FileService],
})
export class ArticleModule {}
