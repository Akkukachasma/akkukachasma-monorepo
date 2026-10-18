"use client";

import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";
import { customerSidebarData } from "../data/sidebar-data";
import { ISidebarBrand, IUser, MenuItem } from "@/lib/types";
import { usePathname } from "next/navigation";
import React from "react";

interface ICustomerSidebarData {
  user: IUser | null;
  brand: ISidebarBrand;
  sections: MenuItem[][];
}

function hydrateSections(
  sections: MenuItem[][],
  pathname: string,
): MenuItem[][] {
  const isActiveFor = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return sections.map((section) =>
    section.map((item) => ({
      ...item,
      isActive: isActiveFor(item.url),
    })),
  );
}

export const useCustomerSidebarData = (): ICustomerSidebarData => {
  const [data, setData] = React.useState<ICustomerSidebarData>({
    user: null,
    brand: customerSidebarData.brand,
    sections: customerSidebarData.sections,
  });
  const completePath = usePathname();
  const pathname =
    completePath?.split("?")?.length > 0
      ? completePath?.split("?")[0]
      : completePath ?? "";

  const { data: user } = useFetch<IUser>({
    endpoint: ENDPOINTS.AUTH.details,
  });

  const hydratedSections = React.useMemo(
    () => hydrateSections(customerSidebarData.sections, pathname),
    [pathname],
  );

  React.useEffect(() => {
    setData((prev) => ({ ...prev, sections: hydratedSections }));
  }, [hydratedSections]);

  React.useEffect(() => {
    setData((prev) => ({
      ...prev,
      user: user
        ? {
            name: user.name ?? "Unknown",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            ...(user.avatar && { avatar: user.avatar }),
          }
        : null,
    }));
  }, [user]);

  return data;
};
