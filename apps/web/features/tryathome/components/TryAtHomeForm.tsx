"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  tryAtHomeFormSchema,
  TryAtHomeFormValues,
} from "../tryathome.validations";
import useCreateTryAtHome from "../mutations/useCreateTryAtHome";
import {
  Loader2,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import PurposeSelect from "./PurposeSelect";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

interface TryAtHomeFormProps {
  className?: string;
}

const TryAtHomeForm: React.FC<TryAtHomeFormProps> = ({ className }) => {
  const createTryAtHome = useCreateTryAtHome();

  const form = useForm<TryAtHomeFormValues>({
    resolver: zodResolver(tryAtHomeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      message: "",
      address: "",
      zip_code: "",
      purpose_id: "",
    },
  });

  const onSubmit = (data: TryAtHomeFormValues) => {
    createTryAtHome.mutate(data);
  };

  return (
    <Card className={`overflow-hidden ${className ?? ""}`}>
      <CardHeader className="space-y-1 border-b border-border/60 bg-muted/30 pb-6 text-center sm:text-left">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold sm:text-2xl">
          Try at home service
        </CardTitle>
        <CardDescription className="text-base">
          Request our try at home service. We&apos;ll bring the perfect eyewear
          to your doorstep.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="purpose_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <QuestionMarkIcon className="h-4 w-4" />
                    Purpose (Optional)
                  </FormLabel>
                  <FormControl>
                    <PurposeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a purpose"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        disabled={createTryAtHome.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        disabled={createTryAtHome.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                        disabled={createTryAtHome.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pin Code Field */}
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pin Code *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your pin code"
                        {...field}
                        disabled={createTryAtHome.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your street address"
                      {...field}
                      disabled={createTryAtHome.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Message (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your preferences, any specific requirements, or questions..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      disabled={createTryAtHome.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={createTryAtHome.isPending}
              size="lg"
            >
              {createTryAtHome.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Home className="mr-2 h-4 w-4" />
                  Request Try At Home Service
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TryAtHomeForm;
