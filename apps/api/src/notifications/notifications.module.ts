import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../token/token.module';
import { NotificationsService } from './notifications.service';
import { NotificationsDispatchService } from './notifications-dispatch.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { ManageNotificationsController } from './manage-notifications.controller';

@Module({
  imports: [PrismaModule, MailModule, TokenModule],
  controllers: [NotificationsController, ManageNotificationsController],
  providers: [
    NotificationsService,
    NotificationsDispatchService,
    NotificationsGateway,
  ],
  exports: [NotificationsService, NotificationsDispatchService, NotificationsGateway],
})
export class NotificationModule {}
