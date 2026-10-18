"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import FileInput from "@/components/ui/file-input";
import FilePreview from "@/components/ui/file-input/FilePreview";
import DragDropIcon from "@/components/icons/DragDropIcon";
import { CompanyInfo } from "../queries/useGetCompanyInfo";
import { signatureDataUrl } from "../utils/signatureDataUrl";

const companyInfoSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  store_name: z.string().min(1, "Store name is required"),
  store_address: z.string().min(1, "Store address is required"),
  full_address: z.string().min(1, "Full address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().min(1, "Website is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  cin: z.string().optional(),
  pan: z.string().optional(),
  signature: z.string().optional(),
});

type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;

export type CompanyInfoSubmitPayload = Omit<
  CompanyInfoFormData,
  "signature"
> & { signature: string | null };

interface CompanyInfoFormProps {
  initialData?: Partial<CompanyInfo> | CompanyInfoFormData;
  onSubmit: (data: CompanyInfoSubmitPayload) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Company Info",
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: initialData
      ? {
          company_name: initialData.company_name ?? "",
          store_name: initialData.store_name ?? "",
          store_address: initialData.store_address ?? "",
          full_address: initialData.full_address ?? "",
          email: initialData.email ?? "",
          phone: initialData.phone ?? "",
          website: initialData.website ?? "",
          gstin: initialData.gstin ?? "",
          cin: initialData.cin ?? "",
          pan: initialData.pan ?? "",
          signature:
            "signature" in initialData && typeof initialData.signature === "string"
              ? initialData.signature
              : "",
        }
      : {
          company_name: "",
          store_name: "",
          store_address: "",
          full_address: "",
          email: "",
          phone: "",
          website: "",
          gstin: "",
          cin: "",
          pan: "",
          signature: "",
        },
  });

  React.useEffect(() => {
    if (!initialData) return;
    reset({
      company_name: initialData.company_name ?? "",
      store_name: initialData.store_name ?? "",
      store_address: initialData.store_address ?? "",
      full_address: initialData.full_address ?? "",
      email: initialData.email ?? "",
      phone: initialData.phone ?? "",
      website: initialData.website ?? "",
      gstin: initialData.gstin ?? "",
      cin: initialData.cin ?? "",
      pan: initialData.pan ?? "",
      signature:
        "signature" in initialData && typeof initialData.signature === "string"
          ? initialData.signature
          : "",
    });
  }, [initialData, reset]);

  const signatureRaw = watch("signature");
  const previewUrl = signatureDataUrl(signatureRaw || undefined);

  const handleSignatureUpload = (files: File[] | null) => {
    if (!files?.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setValue("signature", base64, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const clearSignature = () => {
    setValue("signature", "", { shouldDirty: true });
  };

  const submit = (data: CompanyInfoFormData) => {
    const trimmed = data.signature?.trim();
    onSubmit({
      ...data,
      signature: trimmed ? trimmed : null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="Akku Ka Chasma"
              />
              {errors.company_name && (
                <p className="text-sm text-red-500">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name *</Label>
              <Input
                id="store_name"
                {...register("store_name")}
                placeholder="JEEVANBHIMA NAGAR STORE"
              />
              {errors.store_name && (
                <p className="text-sm text-red-500">
                  {errors.store_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_address">Store Address *</Label>
              <Input
                id="store_address"
                {...register("store_address")}
                placeholder="Akku Ka Chasma (GROUND FLOOR)"
              />
              {errors.store_address && (
                <p className="text-sm text-red-500">
                  {errors.store_address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_address">Full Address *</Label>
              <Input
                id="full_address"
                {...register("full_address")}
                placeholder="Jeevanbhima Nagar Main Road (29) - 560075"
              />
              {errors.full_address && (
                <p className="text-sm text-red-500">
                  {errors.full_address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="support@akkukachasma.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="9999899998"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website *</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="www.akkukachasma.com"
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN *</Label>
              <Input
                id="gstin"
                {...register("gstin")}
                placeholder="06AADCD9571D1ZO"
              />
              {errors.gstin && (
                <p className="text-sm text-red-500">{errors.gstin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cin">CIN (Optional)</Label>
              <Input
                id="cin"
                {...register("cin")}
                placeholder="Company Identification Number"
              />
              {errors.cin && (
                <p className="text-sm text-red-500">{errors.cin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan">PAN (Optional)</Label>
              <Input
                id="pan"
                {...register("pan")}
                placeholder="Permanent Account Number"
              />
              {errors.pan && (
                <p className="text-sm text-red-500">{errors.pan.message}</p>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Digital signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            <div className="space-y-2">
              <Label>Upload image</Label>
              <FileInput
                onChange={(files) => handleSignatureUpload(files)}
                className="size-[100px]"
              >
                <FilePreview
                  file={null}
                  {...(previewUrl && {
                    defaultValue: {
                      type: "image",
                      url: previewUrl,
                    },
                  })}
                  className="size-full grid place-content-center"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
            </div>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-8"
                onClick={clearSignature}
              >
                <X className="h-4 w-4 mr-1" />
                Remove signature
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            PNG or JPG recommended. Stored as base64 for invoices and previews.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CompanyInfoForm;
