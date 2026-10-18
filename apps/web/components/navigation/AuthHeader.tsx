import { IWrapper } from "@/lib/types";
import { Glasses } from "lucide-react";
import Link from "next/link";
import React from "react";
import Logo from "./Logo";
interface AuthHeaderProps extends IWrapper {}
const AuthHeader: React.FC<AuthHeaderProps> = ({ children }) => {
  return (
    <nav className="app-container mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4">
      <div className="flex items-center justify-between">
        <Logo />
        {children}
      </div>
    </nav>
  );
};

export default AuthHeader;
