import DeleteModal from "@/components/newsletters/DeleteModal";
import Header from "@/components/newsletters/header";
import List from "@/components/newsletters/List";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeleteModal />
      <Header />
      <PageWrapper className="pt-0">
        <List />
      </PageWrapper>
    </div>
  );
};
export default page;
