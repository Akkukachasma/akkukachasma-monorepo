"use client";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";

interface ActivitiesHeaderProps {
  children?: React.ReactNode;
}

const Header = ({ children }: ActivitiesHeaderProps) => {
  return (
    <HeaderWrapper
      title="Activities"
      tagline="View API activity and audit log"
    >
      {children}
    </HeaderWrapper>
  );
};

export default Header;
