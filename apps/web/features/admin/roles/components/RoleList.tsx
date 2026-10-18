"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useGetRoles from "../queries/useGetRoles";
import useDeleteRole from "../mutations/useDeleteRole";
import RoleCard from "./RoleCard";
import CreateRoleModal from "./CreateRoleModal";
import EditRoleModal from "./EditRoleModal";
import type { RoleListItem } from "../types";

interface RoleListProps {
  onOpenCreate?: () => void;
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  onOpenCreate,
  createOpen = false,
  onCreateOpenChange,
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleListItem | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleListItem | null>(null);

  const { data: roles, isLoading, isError, refetch } = useGetRoles();
  const deleteRole = useDeleteRole();

  const isCreateOpen = onCreateOpenChange ? createOpen : createModalOpen;
  const setCreateOpen = onCreateOpenChange ?? setCreateModalOpen;
  const handleCreateClick = onOpenCreate ?? (() => setCreateOpen(true));

  const handleDeleteConfirm = async () => {
    if (roleToDelete) {
      await deleteRole.mutateAsync(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-6 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Failed to load roles</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!roles?.length) {
    return (
      <>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No roles found</p>
            <Button onClick={handleCreateClick}>Create Role</Button>
          </CardContent>
        </Card>
        <CreateRoleModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={(r) => setEditRole(r)}
            onDelete={(r) => setRoleToDelete(r)}
          />
        ))}
      </div>

      <CreateRoleModal open={isCreateOpen} onOpenChange={setCreateOpen} />
      <EditRoleModal
        open={!!editRole}
        onOpenChange={(open) => !open && setEditRole(null)}
        role={editRole}
      />
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role
              &quot;{roleToDelete?.name ?? roleToDelete?.code}&quot;? This action
              cannot be undone. The role must not be assigned to any users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRole.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoleList;
