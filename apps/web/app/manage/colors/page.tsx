import AddModal from "@/components/colors/AddModal";
import DeleteModal from "@/components/colors/DeleteModal";
import EditModal from "@/components/colors/EditModal";
import List from "@/components/colors/List";
import Header from "@/components/colors/header";
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
