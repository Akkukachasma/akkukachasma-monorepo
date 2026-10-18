import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/constants';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_ROLE_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_ROLE_MUTATION)
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Get()
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USERS_LIST)
  @ApiOperation({ description: 'List all roles with permissions and user count' })
  async findAll() {
    const data = await this.roleService.findAll();
    return { success: true, data };
  }

  @Get('permissions')
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USERS_LIST)
  @ApiOperation({ description: 'List all permissions for role assignment' })
  async findAllPermissions() {
    const data = await this.roleService.findAllPermissions();
    return { success: true, data };
  }

  @Post()
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USER_CREATE)
  @ApiOperation({ description: 'Create a new (custom) role' })
  async create(
    @Body() dto: CreateRoleDto,
    @Tenant() tenant: ITenant,
  ) {
    const data = await this.roleService.create(dto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Role',
        entityType: 'Role',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data };
  }

  @Get(':id')
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USER_VIEW)
  @ApiOperation({ description: 'Get a single role with permissions' })
  async findOne(@Param('id') id: string) {
    const data = await this.roleService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  @ApiOperation({ description: 'Update a (custom) role' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Tenant() tenant: ITenant,
  ) {
    const data = await this.roleService.update(id, dto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Role',
        entityType: 'Role',
        entityId: id,
      })
      .catch(() => {});
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('admin')
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  @ApiOperation({ description: 'Delete a (custom) role with no users assigned' })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ) {
    await this.roleService.remove(id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Role',
        entityType: 'Role',
        entityId: id,
      })
      .catch(() => {});
    return { success: true };
  }
}
