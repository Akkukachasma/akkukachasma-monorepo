import { Global, Module, forwardRef } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityLoggerService } from './activity-logger.service';
import { ActivityController } from './activity.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [forwardRef(() => NotificationModule)],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityLoggerService, PrismaService],
  exports: [ActivityService, ActivityLoggerService],
})
export class ActivityModule {}
