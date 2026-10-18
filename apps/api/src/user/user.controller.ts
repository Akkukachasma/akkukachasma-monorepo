import { Controller, Get, Query, Param, Post, Body, Put, Delete, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiResponse, PaginatedResponse, PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly prisma: PrismaService) { }

  @Get('')
  @Roles('admin')
  async findAllUsers(@Query() query: GetUsersDto, @Tenant() tenant: ITenant): Promise<PaginatedResponse> {
    const filters: Prisma.UserWhereInput = {
      id: { not: tenant.id },
      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            phone_number: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        ]
      }),
      ...(query.role && {
        user_roles: { some: { role: { code: query.role } } },
      }),
    };

    if (query.blocked === true) {
      filters.deleted_at = { not: null };
    } else {
      // Use getNullFilter for non-blocked users (default and blocked === false)
      Object.assign(filters, this.prisma.getNullFilter<Prisma.UserWhereInput>('deleted_at'));
    }


    const data = await this.userService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
      sort_by: query.sort_by,
    });

    const total = await this.userService.count({ filters });

    // Add blocked status to each user
    const usersWithBlocked = data.map((u) => ({ ...u, blocked: this.userService.isBlocked(u) }));

    return {
      success: true,
      data: usersWithBlocked,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Get(':id')
  @Roles('admin')
  async getUserById(@Param('id') id: string): Promise<ApiResponse> {
    const user = await this.userService.findById(id);
    const data = { ...user, blocked: this.userService.isBlocked(user) };
    return {
      success: true,
      data,
    };
  }

  @Post('')
  @Roles('admin')
  async createUser(@Body() dto: CreateUserDto): Promise<ApiResponse> {
    const data = await this.userService.create(dto);
    return {
      success: true,
      data,
    };
  }

  @Put(':id')
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<ApiResponse> {
    const data = await this.userService.update(id, dto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string): Promise<ApiResponse> {
    const data = await this.userService.delete(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/block')
  @Roles('admin')
  async blockUser(@Param('id') id: string): Promise<ApiResponse> {
    const data = await this.userService.blockUser(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/unblock')
  @Roles('admin')
  async unblockUser(@Param('id') id: string): Promise<ApiResponse> {
    const data = await this.userService.unblockUser(id);
    return {
      success: true,
      data,
    };
  }
}
