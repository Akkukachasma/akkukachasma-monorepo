import PageWrapper from "@/components/wrappers/PageWrapper";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow">
        <div className="portal-empty mx-auto max-w-md">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <Settings className="size-7" />
          </div>
          <p className="font-medium text-foreground">Settings coming soon</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Preference controls will appear here.
          </p>
        </div>
      </PageWrapper>
    </div>
  );
};
export default SettingsPage;
