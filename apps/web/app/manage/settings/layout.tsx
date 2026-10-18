"use client";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/wrappers/PageWrapper";
import { IWrapper } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { label: "Delivery Preferences", path: "delivery-preferences" },
  { label: "Account", path: "account" },
  { label: "Invoice Settings", path: "invoice-settings" },
  { label: "Company Information", path: "company" },
  { label: "Notification Settings", path: "notification" },
  { label: "Pricing", path: "pricing" },
];

const SettingsLayout: React.FC<IWrapper> = ({ children }) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full w-full overflow-auto">
      <HeaderWrapper title="Settings" className="flex-shrink-0" />
      <PageWrapper className="flex-grow w-full flex flex-col gap-4">
        <div className="flex w-full items-center gap-2 flex-shrink-0 overflow-auto">
          {pages.map((page, index) => {
            const getFullPath = (path: string) =>
              path ? `/manage/settings/${path}` : "/manage/settings";
            const isActive = pathname === getFullPath(page.path);
            return (
              <Button
                className={cn(
                  "rounded-3xl hover:bg-foreground hover:text-background animate-smooth",
                )}
                key={index}
                variant={isActive ? "default" : "secondary"}
                asChild
              >
                <Link href={`/manage/settings/${page.path}`}>{page.label}</Link>
              </Button>
            );
          })}
        </div>
        <div className="flex-grow overflow-auto">{children}</div>
      </PageWrapper>
    </div>
  );
};

export default SettingsLayout;
