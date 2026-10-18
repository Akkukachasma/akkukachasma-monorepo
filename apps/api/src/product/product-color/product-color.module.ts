import { Module } from '@nestjs/common';
import { ProductColorService } from './product-color.service';
import { ProductColorController } from './product-color.controller';
import { ProductService } from '../product.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../../file/file.service';
import { BucketService } from '../../bucket/bucket.service';

@Module({
  providers: [
    ProductColorService,
    ProductService,
    PrismaService,
    FileService,
    BucketService,
  ],
  controllers: [ProductColorController],
})
export class ProductColorModule {}
