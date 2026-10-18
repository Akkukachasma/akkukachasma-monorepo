import { InquiriesHeader, InquiriesList } from "@/features/admin/inquiries";
import PageWrapper from "@/components/wrappers/PageWrapper";

export default function Page() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <InquiriesHeader />
      <PageWrapper>
        <InquiriesList />
      </PageWrapper>
    </div>
  );
}
