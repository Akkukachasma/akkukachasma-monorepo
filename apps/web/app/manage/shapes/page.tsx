import AddModal from "@/components/shapes/AddModal";
import DeleteModal from "@/components/shapes/DeleteModal";
import EditModal from "@/components/shapes/EditModal";
import Header from "@/components/shapes/header";
import List from "@/components/shapes/List";
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
