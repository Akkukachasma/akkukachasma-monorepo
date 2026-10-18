"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Eye, Calendar, User, Plus } from "lucide-react";
import dayjs from "dayjs";
import { CompanyInfo } from "../queries/useGetCompanyInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useCreateCompanyInfo, {
  type CreateCompanyInfoData,
} from "../mutations/useCreateCompanyInfo";
import CompanyInfoForm, {
  type CompanyInfoSubmitPayload,
} from "./CompanyInfoForm";
import { signatureDataUrl } from "../utils/signatureDataUrl";

interface CompanyInfoCardProps {
  companyInfo: CompanyInfo | null;
  onEdit: (companyInfo: CompanyInfo) => void;
  onDelete: (id: string) => void;
  onView: (companyInfo: CompanyInfo) => void;
  isLoading?: boolean;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  companyInfo,
  onEdit,
  onView,
  isLoading = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createMutation = useCreateCompanyInfo();
  const handleCreate = (data: CompanyInfoSubmitPayload) => {
    const payload: CreateCompanyInfoData = {
      company_name: data.company_name,
      store_name: data.store_name,
      store_address: data.store_address,
      full_address: data.full_address,
      email: data.email,
      phone: data.phone,
      website: data.website,
      gstin: data.gstin,
      cin: data.cin,
      pan: data.pan,
      signature: data.signature ?? undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo) {
    return (
      <>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Company Information</DialogTitle>
            </DialogHeader>
            <CompanyInfoForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create Company Info"
            />
          </DialogContent>
        </Dialog>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                No Company Information
              </h3>
              <p className="text-gray-500 mb-4">
                No company information has been added yet. Create the first
                record to get started.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const sigUrl = signatureDataUrl(companyInfo.signature);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {companyInfo.company_name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">
                {companyInfo.company_name}
              </CardTitle>
              <p className="text-sm text-gray-500">{companyInfo.store_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(companyInfo)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(companyInfo)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Email:</span>
              <span>{companyInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Phone:</span>
              <span>{companyInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Website:</span>
              <span>{companyInfo.website}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">GSTIN:</span>
              <span>{companyInfo.gstin}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Address:</span>
              <span className="text-gray-600">{companyInfo.full_address}</span>
            </div>
            {companyInfo.cin && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">CIN:</span>
                <span>{companyInfo.cin}</span>
              </div>
            )}
            {companyInfo.pan && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">PAN:</span>
                <span>{companyInfo.pan}</span>
              </div>
            )}
          </div>
        </div>

        {sigUrl && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <span className="text-sm font-medium">Signature</span>
              <div className="border rounded-md p-2 inline-block bg-white">
                <img
                  src={sigUrl}
                  alt="Company signature"
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />
        <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Updated:{" "}
                {dayjs(companyInfo.updated_at).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>By: {companyInfo.updated_by.name}</span>
            </div>
          </div>
          <Badge variant="secondary">
            {sigUrl ? "Has signature" : "No signature"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
