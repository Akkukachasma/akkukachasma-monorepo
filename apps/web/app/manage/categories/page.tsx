import AddModal from "@/components/categories/AddModal";
import DeleteModal from "@/components/categories/DeleteModal";
import EditModal from "@/components/categories/EditModal";
import Header from "@/components/categories/header";
import List from "@/components/categories/List";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page=()=>
{
    return(
        <div className="flex flex-col h-full overflow-auto">
        <DeleteModal />
        <EditModal />
        <AddModal />
        <Header />
        <PageWrapper>
          <List />
        </PageWrapper>
      </div>
    )
}
export default page;