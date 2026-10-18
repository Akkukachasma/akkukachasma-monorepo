"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeValues,
} from "@/lib/validations/newsletter-subscribe.validation";

const FooterNewsletterSubscribe = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<NewsletterSubscribeValues>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { number: "" },
  });

  const onSubmit = async (values: NewsletterSubscribeValues) => {
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      const res = await api.post(ENDPOINTS.newsletter.subscribe, {
        number: values.number.trim(),
      });
      toast({
        description: res.data?.message ?? "You are subscribed.",
        variant: "default",
      });
      form.reset();
    } catch (e) {
      toast({
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 w-full max-w-xl mx-auto">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="WhatsApp mobile (e.g. xxxxx xxxxx)"
          className="h-11 flex-1 rounded-md border bg-background px-4"
          aria-label="WhatsApp mobile number for updates"
          disabled={isSubmitting}
          {...form.register("number")}
        />
        <Button
          type="submit"
          variant="success"
          className="h-11 shrink-0 gap-2 rounded-md px-6 shadow-lg shadow-input"
          disabled={isSubmitting}
        >
          <span>Subscribe</span>
          <Bell className="h-4 w-4" />
        </Button>
      </form>
      {form.formState.errors.number?.message ? (
        <p className="text-sm text-destructive mt-2 text-left">
          {form.formState.errors.number.message}
        </p>
      ) : null}
    </div>
  );
};

export default FooterNewsletterSubscribe;
