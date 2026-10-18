"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  CompanyInfoCard,
  CompanyInfoForm,
  CompanyInfoModal,
  useGetCompanyInfo,
  useUpdateCompanyInfo,
  type CompanyInfo,
  type CompanyInfoSubmitPayload,
} from "@/features/admin/company-info";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CompanyInfoPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompanyInfo, setSelectedCompanyInfo] =
    useState<CompanyInfo | null>(null);
  const [companyInfoToDelete, setCompanyInfoToDelete] = useState<string | null>(
    null,
  );

  const { data: companyInfo, isLoading } = useGetCompanyInfo();

  const updateMutation = useUpdateCompanyInfo();

  const handleEdit = (companyInfo: CompanyInfo) => {
    setSelectedCompanyInfo(companyInfo);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: CompanyInfoSubmitPayload) => {
    if (selectedCompanyInfo) {
      updateMutation.mutate(
        { id: selectedCompanyInfo.id, data },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            setSelectedCompanyInfo(null);
          },
        },
      );
    }
  };

  const handleView = (companyInfo: CompanyInfo) => {
    setSelectedCompanyInfo(companyInfo);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompanyInfoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company Information</h2>
          <p className="text-gray-600">
            Manage your company details for invoices and branding
          </p>
        </div>
      </div>

      <CompanyInfoCard
        companyInfo={companyInfo || null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company Information</DialogTitle>
          </DialogHeader>
          {selectedCompanyInfo && (
            <CompanyInfoForm
              initialData={selectedCompanyInfo}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              submitLabel="Update Company Info"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <CompanyInfoModal
        companyInfo={selectedCompanyInfo}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCompanyInfo(null);
        }}
      />
    </div>
  );
};

export default CompanyInfoPage;
