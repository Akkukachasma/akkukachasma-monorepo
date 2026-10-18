"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { Plus } from "lucide-react";

interface RolesHeaderProps {
  onCreateClick?: () => void;
}

const RolesHeader: React.FC<RolesHeaderProps> = ({ onCreateClick }) => {
  return (
    <HeaderWrapper title="Roles" tagline="Manage roles in the system">
      {onCreateClick && (
        <Button onClick={onCreateClick} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      )}
    </HeaderWrapper>
  );
};

export default RolesHeader;
