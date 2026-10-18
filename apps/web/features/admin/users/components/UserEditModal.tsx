"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { userEditSchema, UserEditFormValues } from "../user.validations";
import useGetRoles from "@/features/admin/roles/queries/useGetRoles";

interface UserEditModalProps {
  user: {
    id: string;
    email: string;
    name: string;
    phone_number?: string;
    user_roles?: { role: { id: string; code: string; name: string | null } }[];
    roles?: string[];
  };
  onSave: (data: Partial<UserEditFormValues>) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onSave }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: rolesList } = useGetRoles();

  const defaultRoleIds =
    user.user_roles?.map((ur) => ur.role?.id).filter(Boolean) ?? [];

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      role_ids: defaultRoleIds.length ? defaultRoleIds : (rolesList?.[0] ? [rolesList[0].id] : []),
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      const roleIds = user.user_roles?.map((ur) => ur.role?.id).filter(Boolean) ?? [];
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        role_ids: roleIds.length ? roleIds : (rolesList?.[0] ? [rolesList[0].id] : []),
      });
    }
  }, [open, user.id, user.name, user.email, user.phone_number, user.user_roles, rolesList, form]);

  const handleSubmit = async (values: UserEditFormValues) => {
    setSaving(true);
    await onSave({
      name: values.name,
      email: values.email,
      phone_number: values.phone_number,
      role_ids: values.role_ids,
    });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and save changes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {rolesList?.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="role_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role.id)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), role.id]
                                    : (field.value ?? []).filter((id) => id !== role.id);
                                  field.onChange(next);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {role.name ?? role.code}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.formState.isValid}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
