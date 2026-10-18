import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InquiryController],
  providers: [InquiryService, PrismaService],
  exports: [InquiryService],
})
export class InquiryModule {} 