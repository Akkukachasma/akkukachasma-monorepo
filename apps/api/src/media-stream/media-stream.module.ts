import { Module } from '@nestjs/common';
import { BucketModule } from '../bucket/bucket.module';
import { MediaStreamService } from './media-stream.service';

@Module({
  imports: [BucketModule],
  providers: [MediaStreamService],
  exports: [MediaStreamService],
})
export class MediaStreamModule {}
