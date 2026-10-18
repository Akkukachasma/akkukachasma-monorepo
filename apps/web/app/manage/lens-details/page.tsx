import React from "react";
import LensFeatureList from "@/components/lens-details/LensDetailList";
import DeleteLensDetailModal from "@/components/lens-details/DeleteLensDetailModal";
import Header from "@/components/lens-details/header";
import EditLensDetailModal from "@/components/lens-details/EditLensDetailModal";
import AddLensDetailModal from "@/components/lens-details/AddLensDetailModal";
import PageWrapper from "@/components/wrappers/PageWrapper";

const Page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeleteLensDetailModal />
      <EditLensDetailModal />
      <AddLensDetailModal />
      <Header />
      <PageWrapper>
        <LensFeatureList />
      </PageWrapper>
    </div>
  );
};

export default Page;
