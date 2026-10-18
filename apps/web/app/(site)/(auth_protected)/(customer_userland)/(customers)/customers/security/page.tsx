import UpdatePasswordForm from "@/components/account/UpdatePasswordForm";
import PageWrapper from "@/components/wrappers/PageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security | Akku Ka Chasma",
};

const SecurityPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow">
        <UpdatePasswordForm />
      </PageWrapper>
    </div>
  );
};
export default SecurityPage;
