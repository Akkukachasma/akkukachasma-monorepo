"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useGetPermissions, {
  type PermissionItem,
} from "../queries/useGetPermissions";
import useGetRole from "../queries/useGetRole";
import useUpdateRole from "../mutations/useUpdateRole";
import {
  PERMISSION_GROUPS,
  canSelectPermission,
} from "../permission-groups";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoleListItem } from "../types";

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleListItem | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  open,
  onOpenChange,
  role,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: permissions, isLoading: loadingPermissions } = useGetPermissions();
  const { data: roleDetail, isLoading: loadingRole } = useGetRole(role?.id ?? null);
  const updateRole = useUpdateRole(role?.id ?? null);

  useEffect(() => {
    if (roleDetail && open) {
      setName(roleDetail.name ?? roleDetail.code ?? "");
      setDescription(roleDetail.description ?? "");
      setSelectedIds(
        new Set(roleDetail.permissions.map((p) => p.id)),
      );
    }
  }, [roleDetail, open]);

  const codeById = useMemo(() => {
    const m = new Map<string, string>();
    permissions.forEach((p) => m.set(p.id, p.code));
    return m;
  }, [permissions]);

  const permissionsByGroup = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => ({
      ...group,
      permissions: group.codes
        .map((code) => permissions.find((p) => p.code === code))
        .filter(Boolean) as PermissionItem[],
    }));
  }, [permissions]);

  const allSelected =
    permissions.length > 0 &&
    permissions.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(permissions.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleTogglePermission = (id: string, code: string, checked: boolean) => {
    const group = PERMISSION_GROUPS.find((g) => g.codes.includes(code));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
        if (group && code === group.gateCode) {
          group.codes.forEach((c) => {
            const perm = permissions.find((p) => p.code === c);
            if (perm && perm.id !== id) next.delete(perm.id);
          });
        }
      }
      return next;
    });
  };

  const isPermissionDisabled = (code: string) => {
    return !canSelectPermission(code, selectedIds, codeById);
  };

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async () => {
    if (!role?.id) return;
    await updateRole.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      permission_ids: Array.from(selectedIds),
    });
    handleClose();
  };

  const isLoading = loadingPermissions || loadingRole;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 py-2 border-b">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Title</Label>
                <Input
                  id="edit-role-name"
                  placeholder="e.g. Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role-desc">Description</Label>
                <textarea
                  id="edit-role-desc"
                  placeholder="Start typing..."
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 py-3 border-b">
              <Checkbox
                id="edit-select-all"
                checked={allSelected}
                onCheckedChange={(c) => handleSelectAll(c === true)}
              />
              <label
                htmlFor="edit-select-all"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Select all
              </label>
            </div>
            <div className="overflow-y-auto flex-1 py-4 space-y-6 max-h-[40vh]">
              {permissionsByGroup.map(
                (group) =>
                  group.permissions.length > 0 && (
                    <div key={group.title} className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        {group.title}
                      </h4>
                      <div className="space-y-2 pl-2">
                        {group.permissions.map((p) => {
                          const disabled = isPermissionDisabled(p.code);
                          const isGate = group.gateCode === p.code;
                          return (
                            <div
                              key={p.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`edit-${p.id}`}
                                checked={selectedIds.has(p.id)}
                                disabled={disabled}
                                onCheckedChange={(c) =>
                                  handleTogglePermission(
                                    p.id,
                                    p.code,
                                    c === true,
                                  )
                                }
                              />
                              <label
                                htmlFor={`edit-${p.id}`}
                                className={cn(
                                  "text-sm cursor-pointer",
                                  disabled &&
                                    "opacity-50 cursor-not-allowed",
                                )}
                              >
                                {p.name || p.code}
                                {isGate && (
                                  <span className="text-muted-foreground ml-1">
                                    (required for others)
                                  </span>
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={updateRole.isPending || !someSelected}
              >
                {updateRole.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Role"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleModal;
