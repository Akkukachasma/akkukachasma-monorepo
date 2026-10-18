import Header from "@/components/products/header";
import PageWrapper from "@/components/wrappers/PageWrapper";
import List from "@/components/products/List";
import AddModal from "@/components/products/modals/AddModal";

const ProductPage = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <AddModal />
      <PageWrapper className="pt-0">
        <List />
      </PageWrapper>
    </div>
  );
};
export default ProductPage;
