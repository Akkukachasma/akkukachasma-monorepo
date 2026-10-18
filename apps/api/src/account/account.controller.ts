import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { ApiResponse, PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { AccountService } from './account.service';
import { ApiTags } from '@nestjs/swagger';
import { compareString } from '../../lib/utils';

@ApiTags('Manage Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly accountService: AccountService,
  ) {}

  @Put()
  async updateAccountDetails(
    @Body() updateUserDto: UpdateUserDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const user = await this.accountService.findUserById(tenant.id);

    const { avatar, ...rest } = updateUserDto;

    await this.prisma.$transaction(
      async (prisma) => {
        if (user?.avatar && updateUserDto.avatar) {
          await this.bucketService.remove(user.avatar.key);
          await this.fileService.removeFileById({
            file_id: user.avatar.id,
            prisma,
          });
        }
        await this.accountService.updateUser({
          user_id: tenant.id,
          updateUserDto: rest,
          prisma,
        });
        if (avatar) {
          await this.fileService.update({
            file_id: avatar,
            data: {
              is_temp: false,
              user: {
                connect: { id: user.id },
              },
            },
            prisma,
          });
        }
      },
      { maxWait: 40000, timeout: 60000 },
    );
    return { success: true, message: 'Details updated successfully.' };
  }

  @Put('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    if (updatePasswordDto.current_password === updatePasswordDto.new_password) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }
    const user = await this.accountService.findUserById(tenant.id);
    if (!user) throw new NotFoundException('User not found');

    const oldPasswordHash = user.credentials.password;
    const isCorrectCurrentPassword = await compareString(
      updatePasswordDto.current_password,
      oldPasswordHash,
    );

    if (!isCorrectCurrentPassword)
      throw new UnauthorizedException('Incorrect current password');

    await this.accountService.updatePassword(
      tenant.id,
      updatePasswordDto.new_password,
    );
    return { success: true, message: 'Password updated successfully.' };
  }

  @Get('notification-preferences')
  async getNotificationPreferences(@Tenant() tenant: ITenant) {
    const data = await this.accountService.getNotificationPreferences(tenant.id);
    return { success: true, data };
  }

  @Put('notification-preferences')
  async updateNotificationPreferences(
    @Tenant() tenant: ITenant,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const data = await this.accountService.upsertNotificationPreferences(
      tenant.id,
      dto,
    );
    return { success: true, data };
  }
}
