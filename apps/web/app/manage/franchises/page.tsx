import PageWrapper from "@/components/wrappers/PageWrapper";
import {
  FranchiseRequestList,
  FranchiseRequestsHeader,
} from "@/features/franchise-request";

const FranchisePage = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <FranchiseRequestsHeader />
      <PageWrapper>
        <FranchiseRequestList
          status="approved"
          listTitle="Active franchises"
        />
      </PageWrapper>
    </div>
  );
};

export default FranchisePage;
