import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PopularityModule } from '../popularity/popularity.module';

@Module({
  imports: [PrismaModule, PopularityModule],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
