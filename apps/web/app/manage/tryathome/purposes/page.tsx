import PageWrapper from "@/components/wrappers/PageWrapper";
import {
  TryAtHomePurposesHeader,
  TryAtHomePurposesList,
  AddTryAtHomePurposeModal,
  DeleteTryAtHomePurposeModal,
} from "@/features/tryathome";

const TryAtHomePurposesPage = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <DeleteTryAtHomePurposeModal />
      <AddTryAtHomePurposeModal />
      <TryAtHomePurposesHeader />
      <PageWrapper>
        <TryAtHomePurposesList />
      </PageWrapper>
    </div>
  );
};

export default TryAtHomePurposesPage;
