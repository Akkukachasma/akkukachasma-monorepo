import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BucketModule } from '../bucket/bucket.module';
import { FileModule } from '../file/file.module';
import { MediaStreamModule } from '../media-stream/media-stream.module';
import { HeroMediaController } from './hero-media.controller';
import { HeroMediaService } from './hero-media.service';

@Module({
  imports: [PrismaModule, BucketModule, FileModule, MediaStreamModule],
  controllers: [HeroMediaController],
  providers: [HeroMediaService],
  exports: [HeroMediaService],
})
export class HeroMediaModule {}
