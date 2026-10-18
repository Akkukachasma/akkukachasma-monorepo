"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
} from "lucide-react";
import dayjs from "dayjs";
import { CompanyInfo } from "../queries/useGetCompanyInfo";
import { signatureDataUrl } from "../utils/signatureDataUrl";

interface CompanyInfoModalProps {
  companyInfo: CompanyInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  companyInfo,
  isOpen,
  onClose,
}) => {
  if (!companyInfo) return null;

  const sigUrl = signatureDataUrl(companyInfo.signature);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" showCloseIcon>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {companyInfo.company_name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            {companyInfo.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Company Name:</span>
                  <span>{companyInfo.company_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Store Name:</span>
                  <span>{companyInfo.store_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Store Address:</span>
                  <span>{companyInfo.store_address}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Full Address:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {companyInfo.full_address}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Email:</span>
                <span>{companyInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone:</span>
                <span>{companyInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Website:</span>
                <span>{companyInfo.website}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Legal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">GSTIN:</span>
                <span>{companyInfo.gstin}</span>
              </div>
              {companyInfo.cin && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">CIN:</span>
                  <span>{companyInfo.cin}</span>
                </div>
              )}
              {companyInfo.pan && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">PAN:</span>
                  <span>{companyInfo.pan}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Signature</h3>
            {sigUrl ? (
              <div className="mt-2">
                <img
                  src={sigUrl}
                  alt="Digital Signature"
                  className="w-32 h-32 object-contain border rounded"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                No signature uploaded
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Audit Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <span>
                  {dayjs(companyInfo.created_at).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Last Updated:</span>
                <span>
                  {dayjs(companyInfo.updated_at).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Updated By:</span>
                <span>
                  {companyInfo.updated_by.name} ({companyInfo.updated_by.email})
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyInfoModal;
