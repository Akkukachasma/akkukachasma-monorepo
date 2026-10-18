import PageWrapper from "@/components/wrappers/PageWrapper";
import {
  FranchiseRequestList,
  FranchiseRequestsHeader,
} from "@/features/franchise-request";

const FranchiseRequestsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <FranchiseRequestsHeader />
      <PageWrapper>
        <FranchiseRequestList
          status="pending"
          listTitle="New franchise requests"
        />
      </PageWrapper>
    </div>
  );
};

export default FranchiseRequestsPage;
