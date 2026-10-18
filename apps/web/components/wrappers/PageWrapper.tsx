import { IWrapper } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

const PageWrapper: React.FC<IWrapper & { className?: string }> = ({
  children,
  className = "",
}) => {
  return (
    <div className={cn("w-full overflow-auto p-4", className)}>
      {children}
    </div>
  );
};

export default PageWrapper;
