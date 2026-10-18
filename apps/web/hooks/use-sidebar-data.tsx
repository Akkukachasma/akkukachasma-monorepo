import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";
import { sidebarData } from "@/lib/list";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import { ISidebarBrand, IUser, MenuItem } from "@/lib/types";
import { usePathname } from "next/navigation";
import React from "react";

interface ISidebarData {
  user: IUser | null;
  brand: ISidebarBrand;
  menus: MenuItem[];
}

export const useSidebarData = (): ISidebarData => {
  const [data, setData] = React.useState<ISidebarData>(sidebarData);
  const completePath = usePathname();
  const pathname =
    completePath?.split("?")?.length > 0
      ? completePath?.split("?")[0]
      : completePath;

  const { data: user } = useFetch<IUser & { permissions?: string[] }>({
    endpoint: ENDPOINTS.AUTH.details,
  });

  const userPermissions = React.useMemo(
    () => user?.permissions ?? [],
    [user?.permissions]
  );

  const hydratedMenus = React.useMemo(() => {
    return sidebarData.menus
      .filter((menu) => {
        if (!menu.permission) return true;
        if (Array.isArray(menu.permission)) {
          return hasAnyPermission(userPermissions, menu.permission);
        }
        return hasPermission(userPermissions, menu.permission);
      })
      .map((menu) => {
        const isActive =
          pathname !== "/manage"
            ? menu.url === pathname ||
              (pathname.startsWith(menu.url) && menu.url !== "/manage")
            : menu.url === pathname;
        const items = Array.isArray(menu.items)
          ? menu.items
            .filter((item) => {
              if (!item.permission) return true;
              return hasPermission(userPermissions, item.permission);
            })
            .map((item) => ({
              ...item,
              isActive: item.url === pathname,
            }))
          : undefined;
        return {
          ...menu,
          isActive: items ? items.some((i) => i.isActive) : isActive,
          items,
        };
      });
  }, [pathname, userPermissions]);

  React.useEffect(() => {
    setData((prev) => ({
      ...prev,
      menus: hydratedMenus,
    }));
  }, [hydratedMenus]);

  React.useEffect(() => {
    setData((prev) => ({
      ...prev,
      user: user
        ? {
            name: user.name ?? "Unknown",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            ...(user.avatar && { avatar: user.avatar }),
            ...(user.roles && { roles: user.roles }),
            ...(user.permissions && { permissions: user.permissions }),
          }
        : null,
    }));
  }, [user]);

  return data;
};
