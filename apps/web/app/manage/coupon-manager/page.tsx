import AddModal from "@/components/coupon-manager/AddModal";
import DeleteModal from "@/components/coupon-manager/DeleteModal";
import EditModal from "@/components/coupon-manager/EditModal";
import Header from "@/components/coupon-manager/header";
import List from "@/components/coupon-manager/List";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeleteModal />
      <EditModal />
      <AddModal />
      <Header />
      <PageWrapper className="pt-0">
        <List />
      </PageWrapper>
    </div>
  );
};
export default page;
