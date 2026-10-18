import PageWrapper from "@/components/wrappers/PageWrapper";
import PrescriptionsPageContent from "@/features/prescriptions/components/PrescriptionsPageContent";

const PrescriptionsPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="min-h-0 flex-1">
        <PrescriptionsPageContent />
      </PageWrapper>
    </div>
  );
};

export default PrescriptionsPage;
