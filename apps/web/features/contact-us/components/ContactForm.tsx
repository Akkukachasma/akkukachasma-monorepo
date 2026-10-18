"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import { Mail, User, MessageSquare, Loader2, Phone } from "lucide-react";

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

import {
  useCreateInquiry,
  contactFormSchema,
  type ContactFormValues,
} from "@/features/contact-us";

interface ContactFormProps {
  title?: string;
  description?: string;
  source?: "contact_us" | "product_page" | "blog" | "other";
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  title = "Contact Us",
  description = "We're here to help and answer any question you might have",
  source = "contact_us",
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
    <div className={`w-full max-w-lg ${className}`}>
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-center">{title}</h2>
        <p className="text-muted-foreground text-center">{description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="First name"
                        {...field}
                        className="pl-10"
                        disabled={createInquiryMutation.isPending}
                      />
                    </div>
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      {...field}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      type="email"
                      className="pl-10"
                      disabled={createInquiryMutation.isPending}
                    />
                  </div>
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="+91 xxxxx xxxxx"
                      {...field}
                      type="tel"
                      className="pl-10"
                      disabled={createInquiryMutation.isPending}
                    />
                  </div>
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
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      {...field}
                      className="pl-10 min-h-[120px]"
                      disabled={createInquiryMutation.isPending}
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
            disabled={createInquiryMutation.isPending}
          >
            {createInquiryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
