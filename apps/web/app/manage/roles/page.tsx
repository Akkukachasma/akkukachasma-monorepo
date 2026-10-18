"use client";

import React, { useState } from "react";
import PageWrapper from "@/components/wrappers/PageWrapper";
import { RolesHeader, RoleList } from "@/features/admin/roles";

export default function AdminRolesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-auto">
      <RolesHeader onCreateClick={() => setCreateModalOpen(true)} />
      <PageWrapper>
        <RoleList
          createOpen={createModalOpen}
          onCreateOpenChange={setCreateModalOpen}
        />
      </PageWrapper>
    </div>
  );
}
