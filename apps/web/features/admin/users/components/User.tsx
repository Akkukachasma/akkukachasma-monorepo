"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Ban, Unlock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserEditModal from "./UserEditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProps {
  user?: {
    id: string;
    email: string;
    name: string;
    phone_number?: string;
    roles: string[];
    user_roles?: { role: { id: string; code: string; name: string | null } }[];
    created_at: string;
    updated_at: string;
    agree_t_and_c: boolean;
    avatar?: { url: string } | null;
    email_verified?: string | null;
    blocked?: boolean;
  };
  loading?: boolean;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onEdit?: (id: string, data: any) => Promise<void>;
}

const User = React.forwardRef<HTMLDivElement, UserProps>(
  ({ user, loading, onBlock, onUnblock, onEdit }, ref) => {
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);

    if (loading) {
      return (
        <Card
          ref={ref}
          className="hover:shadow-md transition-shadow animate-pulse"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                  </Avatar>
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm min-w-0">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (!user) return null;
    const firstLetter = user.name?.[0]?.toUpperCase() || "U";
    return (
      <Card ref={ref} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  {user.avatar?.url ? (
                    <AvatarImage src={user.avatar.url} alt={user.name} />
                  ) : (
                    <AvatarFallback>{firstLetter}</AvatarFallback>
                  )}
                </Avatar>
                <h3
                  className="font-semibold truncate min-w-0 max-w-[120px] sm:max-w-xs"
                  title={user.name}
                >
                  {user.name}
                </h3>
                {user.roles?.length
                  ? user.roles.map((r) => (
                      <Badge key={r} variant="secondary">
                        {r}
                      </Badge>
                    ))
                  : null}
                {user.email_verified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
                {user.blocked && <Badge variant="destructive">Blocked</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span
                    className="truncate break-all min-w-0 max-w-[120px] sm:max-w-xs"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center gap-1 min-w-0">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span
                      className="truncate break-all min-w-0 max-w-[100px] sm:max-w-xs"
                      title={user.phone_number}
                    >
                      {user.phone_number}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 min-w-0">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate min-w-0 max-w-[100px] sm:max-w-xs">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {user.agree_t_and_c ? "Agreed to T&C" : "Not agreed to T&C"}
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4 items-end">
              <UserEditModal
                user={user}
                onSave={async (data) => onEdit && (await onEdit(user.id, data))}
              />
              {user.blocked ? (
                <AlertDialog
                  open={unblockDialogOpen}
                  onOpenChange={setUnblockDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setUnblockDialogOpen(true)}
                    >
                      <Unlock className="h-4 w-4 mr-1" /> Unblock
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unblock User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to unblock this user? They will be
                        able to log in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          onUnblock && user.id && onUnblock(user.id)
                        }
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        Unblock
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog
                  open={blockDialogOpen}
                  onOpenChange={setBlockDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setBlockDialogOpen(true)}
                    >
                      <Ban className="h-4 w-4 mr-1" /> Block
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Block User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to block this user? They will not
                        be able to log in.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onBlock && user.id && onBlock(user.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Block
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

User.displayName = "User";

export default User;
