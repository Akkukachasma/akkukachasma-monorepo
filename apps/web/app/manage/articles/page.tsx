import DeleteModal from "@/components/articles/DeleteModal";
import Header from "@/components/articles/header";
import List from "@/components/articles/List";
import AdminPage from "@/components/navigation/admin/AdminPage";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <AdminPage>
      <DeleteModal />
      <Header />
      <PageWrapper>
        <List />
      </PageWrapper>
    </AdminPage>
  );
};
export default page;
