"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState } from "react";
import { Phone, KeyRound, ArrowLeft } from "lucide-react";

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
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { phoneOtpSendSchema, phoneOtpVerifySchema } from "@/lib/validations/auth.validation";
import useSendPhoneOtp from "@/lib/mutations/auth/useSendPhoneOtp";
import useVerifyPhoneOtp from "@/lib/mutations/auth/useVerifyPhoneOtp";
import { ContinueWithGoogle } from "@/features/auth/components";

type SendFormValues = z.infer<typeof phoneOtpSendSchema>;
type VerifyFormValues = z.infer<typeof phoneOtpVerifySchema>;

interface LoginFormProps {
  forAdmin?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ forAdmin = false }) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const sendForm = useForm<SendFormValues>({
    resolver: zodResolver(phoneOtpSendSchema),
    defaultValues: { phone_number: "" },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(phoneOtpVerifySchema),
    defaultValues: { phone_number: "", otp: "" },
  });

  const sendMutation = useSendPhoneOtp();
  const verifyMutation = useVerifyPhoneOtp();

  const onSendOtp = (values: SendFormValues) => {
    sendMutation.mutate(values.phone_number, {
      onSuccess: () => {
        setPhoneNumber(values.phone_number);
        verifyForm.setValue("phone_number", values.phone_number);
        setStep("otp");
      },
    });
  };

  const onVerifyOtp = (values: VerifyFormValues) => {
    verifyMutation.mutate({ phone_number: values.phone_number, otp: values.otp });
  };

  const handleResendOtp = () => {
    sendMutation.mutate(phoneNumber);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <h2 className="text-2xl font-bold text-center">
          {step === "phone" ? "Welcome" : "Enter OTP"}
        </h2>
        <p className="text-muted-foreground text-center text-sm">
          {step === "phone"
            ? "Enter your mobile number to continue"
            : `OTP sent to +91 ${phoneNumber}`}
        </p>
      </CardHeader>

      <CardContent>
        {step === "phone" ? (
          <Form {...sendForm}>
            <form onSubmit={sendForm.handleSubmit(onSendOtp)} className="space-y-6">
              <FormField
                control={sendForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          {...field}
                          disabled={sendMutation.isPending}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={sendMutation.isPending}>
                <ProcessIndicator
                  isProcessing={sendMutation.isPending}
                  btnText="Send OTP"
                  processingText="Sending OTP..."
                />
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="space-y-6">
              <FormField
                control={verifyForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter 6-digit OTP"
                          {...field}
                          disabled={verifyMutation.isPending}
                          type="tel"
                          inputMode="numeric"
                          maxLength={6}
                          className="pl-10 tracking-widest text-center text-lg font-semibold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                <ProcessIndicator
                  isProcessing={verifyMutation.isPending}
                  btnText="Verify & Continue"
                  processingText="Verifying..."
                />
              </Button>

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("phone")}
                  disabled={verifyMutation.isPending}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Change number
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={sendMutation.isPending || verifyMutation.isPending}
                  className="px-0"
                >
                  {sendMutation.isPending ? "Resending..." : "Resend OTP"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      {!forAdmin && step === "phone" && (
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <ContinueWithGoogle disabled={sendMutation.isPending} />
        </CardFooter>
      )}
    </Card>
  );
};
