"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  useCreateInquiry,
  contactFormSchema,
  type ContactFormValues,
} from "@/features/contact-us";

interface CompactContactFormProps {
  title?: string;
  description?: string;
  source?: "contact_us" | "product_page" | "blog" | "other";
  className?: string;
}

export const CompactContactForm: React.FC<CompactContactFormProps> = ({
  title = "Ask About This Product",
  description = "Have questions about this product? We're here to help!",
  source = "product_page",
  className = "",
}) => {
  const createInquiryMutation = useCreateInquiry();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      message: "",
      source: source,
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    // Override the source with the prop value
    const formData = { ...values, source };
    createInquiryMutation.mutate(formData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        {...field}
                        className="h-9"
                        disabled={createInquiryMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        {...field}
                        className="h-9"
                        disabled={createInquiryMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      type="email"
                      className="h-9"
                      disabled={createInquiryMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 98765 43210"
                      {...field}
                      type="tel"
                      className="h-9"
                      disabled={createInquiryMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your inquiry..."
                      {...field}
                      className="min-h-[80px] resize-none"
                      disabled={createInquiryMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={createInquiryMutation.isPending}
            >
              {createInquiryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
