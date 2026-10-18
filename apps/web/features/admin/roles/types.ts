export interface PermissionSummary {
  id: string;
  code: string;
  name?: string | null;
}

export interface RoleListItem {
  id: string;
  code: string;
  name?: string | null;
  description?: string | null;
  is_system_role: boolean;
  is_active: boolean;
  permissions: PermissionSummary[];
  users_count: number;
}

export interface RoleDetail extends RoleListItem {
  permissions: Array<{
    id: string;
    code: string;
    name?: string | null;
    description?: string | null;
  }>;
}

export interface GetRolesResponse {
  success: boolean;
  data: RoleListItem[];
}

export interface GetRoleResponse {
  success: boolean;
  data: RoleDetail;
}
