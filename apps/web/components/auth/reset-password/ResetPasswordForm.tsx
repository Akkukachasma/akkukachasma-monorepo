"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useResetPassword from "@/lib/mutations/auth/useResetPassword";
import { cn } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validations/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockClosedIcon } from "@radix-ui/react-icons";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    mode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPassword, isPending } = useResetPassword(token);
  const onSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    resetPassword(data);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "w-full max-w-[90%] sm:max-w-[500px] p-6 sm:p-8 bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center justify-center gap-4 sm:gap-6 text-center animate-fade-in",
          isPending && "pointer-events-none opacity-50",
        )}
      >
        {/* Icon with animation */}
        <div className="p-4 bg-primary/10 rounded-full animate-bounce">
          <LockClosedIcon className="w-16 h-16 text-primary" />
        </div>

        {/* Title with animation */}
        <p className="animate-pulse max-w-64">Create a new password.</p>

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem className="w-full  sm:w-3/4">
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem className="w-full  sm:w-3/4">
              <FormControl>
                <Input
                  type="password"
                  placeholder="Re-Enter your password to confirm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />

        <Button>
          <ProcessIndicator
            isProcessing={isPending}
            btnText="Reset Now"
            processingText="Please wait..."
          />
        </Button>
      </form>
    </Form>
  );
};
export default ResetPasswordForm;
