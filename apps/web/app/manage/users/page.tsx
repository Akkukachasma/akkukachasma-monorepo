"use client";
import PageWrapper from "@/components/wrappers/PageWrapper";
import UserList from "@/features/admin/users/components/UserList";
import UserHeader from "@/features/admin/users/components/UserHeader";

export default function Page() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <UserHeader />
      <PageWrapper>
        <UserList />
      </PageWrapper>
    </div>
  );
}
