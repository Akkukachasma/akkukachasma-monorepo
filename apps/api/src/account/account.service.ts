import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashString } from '../../lib/utils';
interface IUpdateUser extends IWithTransactionClient {
  user_id: string;
  updateUserDto: Omit<UpdateUserDto, 'avatar'>;
}
@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        avatar: { select: this.prisma.getFileSelection() },
        credentials: true,
      },
    });
  }

  async updateUser({ updateUserDto, user_id }: IUpdateUser) {
    return await this.prisma.user.update({
      where: { id: user_id },
      data: updateUserDto,
    });
  }

  async updatePassword(user_id: string, newPassword: string) {
    return await this.prisma.credential.update({
      where: { user_id },
      data: {
        password: await hashString(newPassword),
      },
    });
  }

  async getNotificationPreferences(userId: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { user_id: userId },
      include: { notification: true },
    });
    return {
      email: setting?.notification?.email ?? true,
      in_app: setting?.notification?.in_app ?? true,
      phone: setting?.notification?.phone ?? true,
    };
  }

  async upsertNotificationPreferences(
    userId: string,
    prefs: { email?: boolean; in_app?: boolean; phone?: boolean },
  ) {
    let setting = await this.prisma.setting.findUnique({
      where: { user_id: userId },
    });
    if (!setting) {
      setting = await this.prisma.setting.create({
        data: { user_id: userId },
      });
    }
    const existing = await this.prisma.notificationSetting.findUnique({
      where: { setting_id: setting.id },
    });
    if (!existing) {
      await this.prisma.notificationSetting.create({
        data: {
          setting_id: setting.id,
          email: prefs.email ?? true,
          in_app: prefs.in_app ?? true,
          phone: prefs.phone ?? true,
        },
      });
    } else {
      await this.prisma.notificationSetting.update({
        where: { setting_id: setting.id },
        data: {
          ...(prefs.email !== undefined ? { email: prefs.email } : {}),
          ...(prefs.in_app !== undefined ? { in_app: prefs.in_app } : {}),
          ...(prefs.phone !== undefined ? { phone: prefs.phone } : {}),
        },
      });
    }
    return this.getNotificationPreferences(userId);
  }
}
