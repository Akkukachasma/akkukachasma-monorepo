"use client";
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
import useSessionStorage from "@/hooks/use-session-storage";
import { forgotPasswordSchema } from "@/lib/validations/auth.validation";
import useForgot from "@/lib/mutations/auth/useForgot";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import z from "zod";
import { cn } from "@/lib/utils";

const SendPasswordResetLinkForm = () => {
  const { value: email } = useSessionStorage<string>("reset_email");

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    mode: "all",
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate, isPending, wait } = useForgot();

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    mutate(data);
  };

  const resend = () => {
    if (email) {
      mutate({ email: email });
    }
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
          <EnvelopeOpenIcon className="w-16 h-16 text-primary" />
        </div>

        {/* Title with animation */}
        <p className="animate-pulse max-w-64">
          Enter your email address to receive a password reset link.
        </p>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full  sm:w-3/4">
              <FormControl>
                <Input placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />
        {wait > 0 && (
          <p className="text-sm text-muted-foreground">
            You can resend the email in {wait} seconds.
          </p>
        )}
        {wait === 0 && (
          <Button>
            <ProcessIndicator
              isProcessing={isPending}
              btnText="Send Reset Link"
              processingText="Please wait..."
            />
          </Button>
        )}
      </form>
    </Form>
  );
};
export default SendPasswordResetLinkForm;
