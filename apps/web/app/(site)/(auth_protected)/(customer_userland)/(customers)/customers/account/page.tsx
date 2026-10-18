import UserProfileForm from "@/components/account/UserProfileForm";
import PageWrapper from "@/components/wrappers/PageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Akku Ka Chasma",
};

const AccountPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow">
        <UserProfileForm />
      </PageWrapper>
    </div>
  );
};
export default AccountPage;
