import AddModal from "@/components/banners/detail-view/AddModal";
import DeleteModal from "@/components/banners/detail-view/DeleteModal";
import EditModal from "@/components/banners/detail-view/EditModal";
import Header from "@/components/banners/detail-view/header";
import List from "@/components/banners/detail-view/List";
import PageWrapper from "@/components/wrappers/PageWrapper";
import React from "react";

interface BannerDetailsPageProps {
  params: Promise<{ id: string }>;
}
const BannerDetailsPage = async ({
  params,
}: BannerDetailsPageProps) => {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <AddModal />
      <EditModal />
      <DeleteModal />
      <PageWrapper className="flex-grow">
        <List />
      </PageWrapper>
    </div>
  );
};
export default BannerDetailsPage;
