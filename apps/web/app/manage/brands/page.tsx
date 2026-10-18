import AddModal from "@/components/brands/AddModal";
import DeleteModal from "@/components/brands/DeleteModal";
import EditModal from "@/components/brands/EditModal";
import List from "@/components/brands/List";
import Header from "@/components/brands/header";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeleteModal />
      <EditModal />
      <AddModal />
      <Header />
      <PageWrapper>
        <List />
      </PageWrapper>
    </div>
  );
};
export default page;
