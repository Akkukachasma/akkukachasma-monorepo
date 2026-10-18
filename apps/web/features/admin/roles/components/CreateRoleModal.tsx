"use client";

import React, { useState, useMemo } from "react";
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
import useCreateRole from "../mutations/useCreateRole";
import {
  PERMISSION_GROUPS,
  canSelectPermission,
} from "../permission-groups";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEP_DETAILS = 1;
const STEP_PERMISSIONS = 2;

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState(STEP_DETAILS);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: permissions, isLoading: loadingPermissions } = useGetPermissions();
  const createRole = useCreateRole();

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

  const allPermissionIds = useMemo(
    () => new Set(permissions.map((p) => p.id)),
    [permissions],
  );
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

  const handleClose = () => {
    setStep(STEP_DETAILS);
    setName("");
    setDescription("");
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const canGoToPermissions =
    name.trim().length > 0;

  const handleNext = () => {
    if (step === STEP_DETAILS && canGoToPermissions) {
      setStep(STEP_PERMISSIONS);
    }
  };

  const handleSubmit = async () => {
    if (step !== STEP_PERMISSIONS) return;
    await createRole.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      permission_ids: Array.from(selectedIds),
    });
    handleClose();
  };

  const handleBack = () => setStep(STEP_DETAILS);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === STEP_DETAILS ? "Create Role" : "Manage Permissions"}
          </DialogTitle>
        </DialogHeader>

        {step === STEP_DETAILS && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Title</Label>
              <Input
                id="role-name"
                placeholder="e.g. Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <textarea
                id="role-desc"
                placeholder="Start typing..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleNext}
                disabled={!canGoToPermissions}
                className="gap-1"
              >
                Select Permissions
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === STEP_PERMISSIONS && (
          <div className="flex flex-col flex-1 min-h-0">
            {loadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 py-2 border-b">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={(c) =>
                      handleSelectAll(c === true)}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Select all
                  </label>
                </div>
                <div className="overflow-y-auto flex-1 py-4 space-y-6 max-h-[50vh]">
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
                                    id={p.id}
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
                                    htmlFor={p.id}
                                    className={cn(
                                      "text-sm cursor-pointer",
                                      disabled && "opacity-50 cursor-not-allowed",
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
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createRole.isPending || !someSelected}
                  >
                    {createRole.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
