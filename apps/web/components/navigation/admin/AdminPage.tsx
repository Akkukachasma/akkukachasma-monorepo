import { IWrapper } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

interface AdminPageProps extends IWrapper {
  className?: string;
}

/** This component should be the only wrapper tag for admin pages... */
const AdminPage: React.FC<AdminPageProps> = ({ className = "", children }) => {
  return (
    <div
      className={cn("min-h-[100vh] flex-1 bg-muted/50 md:min-h-min", className)}
    >
      {children}
    </div>
  );
};
export default AdminPage;
