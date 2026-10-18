"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { Mail, Lock } from "lucide-react";

import { Button, ProcessIndicator } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { loginSchema } from "@/lib/validations/auth.validation";
import useLogin from "@/lib/mutations/auth/login/useLogin";
import Link from "next/link";
import { ContinueWithGoogle } from "@/features/auth/components";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  forAdmin?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ forAdmin = false }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const { mutate, isPending } = useLogin();

  const onSubmit = (values: LoginFormValues) => {
    mutate(values);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <h2 className="text-2xl font-bold text-center">Welcome back</h2>
        <p className="text-muted-foreground text-center">
          Enter your credentials to access your account
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        disabled={isPending}
                        type="email"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your password"
                        {...field}
                        disabled={isPending}
                        type="password"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="remember_me"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button
                variant="link"
                className="px-0 font-normal"
                type="button"
                disabled={isPending}
                asChild
              >
                <Link href="/forgot-password">Forgot password?</Link>
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              <ProcessIndicator
                isProcessing={isPending}
                btnText="Sign in"
                processingText="Signing in..."
              />
            </Button>
          </form>
        </Form>
      </CardContent>
      {!forAdmin && (
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <ContinueWithGoogle disabled={isPending} />

          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary underline hover:text-primary/90"
            >
              Sign up
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
