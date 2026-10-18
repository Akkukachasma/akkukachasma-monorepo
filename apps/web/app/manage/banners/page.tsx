import AddModal from "@/components/banners/AddModal";
import DeleteModal from "@/components/banners/DeleteModal";
import EditModal from "@/components/banners/EditModal";
import Header from "@/components/banners/header";
import List from "@/components/banners/List";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <DeleteModal />
      <EditModal />
      <AddModal />
      <PageWrapper className="flex-grow">
        <List />
      </PageWrapper>
    </div>
  );
};
export default page;
