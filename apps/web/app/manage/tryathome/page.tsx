import PageWrapper from "@/components/wrappers/PageWrapper";
import {
  TryAtHomeRequestsHeader,
  TryAtHomeRequestsList,
} from "@/features/tryathome";

const TryAtHomePage = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <TryAtHomeRequestsHeader />
      <PageWrapper>
        <TryAtHomeRequestsList />
      </PageWrapper>
    </div>
  );
};

export default TryAtHomePage;
