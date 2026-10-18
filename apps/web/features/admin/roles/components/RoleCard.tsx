"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Info, Pencil, Trash2 } from "lucide-react";
import type { RoleListItem } from "../types";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: RoleListItem;
  onEdit?: (role: RoleListItem) => void;
  onDelete?: (role: RoleListItem) => void;
  className?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete,
  className,
}) => {
  const isSystemRole = role.is_system_role;
  const userLabel = role.users_count === 1 ? "user" : "users";
  const isCustomRole = !isSystemRole;

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md flex flex-col",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="font-semibold">{role.name ?? role.code}</span>
            {!role.is_active && (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
          {isSystemRole && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Info className="h-4 w-4 shrink-0" />
              <span>System Role</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
              {role.users_count} {userLabel}
            </span>
          </div>
          {isCustomRole && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                onClick={() => onEdit?.(role)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                onClick={() => onDelete?.(role)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 flex-1">
        {role.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {role.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">
            {role.permissions.length} permission
            {role.permissions.length !== 1 ? "s" : ""}
          </span>
          {role.permissions.slice(0, 3).map((p) => (
            <Badge key={p.id} variant="outline" className="text-xs font-mono">
              {p.code}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
