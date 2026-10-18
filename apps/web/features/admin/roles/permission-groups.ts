/**
 * Permission groups for the role form. Each group has a "gate" permission:
 * if the gate is not selected, other permissions in that group cannot be selected.
 * Gate is typically the "list" or primary view permission for the module.
 */
export const PERMISSION_GROUPS: {
  title: string;
  gateCode: string; // code that must be selected before others in group
  codes: string[]; // all codes in this group (gate first)
}[] = [
  {
    title: "Orders",
    gateCode: "orders:list",
    codes: ["orders:list", "order:view", "order:create", "order:update", "order:delete"],
  },
  {
    title: "Products",
    gateCode: "products:list",
    codes: ["products:list", "product:view", "product:create", "product:update", "product:delete"],
  },
  {
    title: "Users",
    gateCode: "users:list",
    codes: ["users:list", "user:view", "user:create", "user:update", "user:delete"],
  },
  {
    title: "Invoices",
    gateCode: "invoices:list",
    codes: ["invoices:list", "invoice:view"],
  },
  {
    title: "Catalog",
    gateCode: "catalog:manage",
    codes: ["catalog:manage"],
  },
  {
    title: "Settings",
    gateCode: "settings:manage",
    codes: ["settings:manage"],
  },
  {
    title: "Dashboard",
    gateCode: "dashboard:view",
    codes: ["dashboard:view"],
  },
  {
    title: "Activities",
    gateCode: "activities:list",
    codes: ["activities:list"],
  },
  {
    title: "Homepage hero video",
    gateCode: "hero-media:view",
    codes: ["hero-media:view", "hero-media:manage"],
  },
  {
    title: "Product embeddings",
    gateCode: "product-embedding:view",
    codes: ["product-embedding:view", "product-embedding:manage"],
  },
];

export function getGroupForPermission(code: string): (typeof PERMISSION_GROUPS)[0] | undefined {
  return PERMISSION_GROUPS.find((g) => g.codes.includes(code));
}

export function isGatePermission(code: string): boolean {
  const group = getGroupForPermission(code);
  return group ? group.gateCode === code : false;
}

/** Returns true if the permission can be selected (gate for its group is in selectedIds). */
export function canSelectPermission(
  permissionCode: string,
  selectedIds: Set<string>,
  codeById: Map<string, string>,
): boolean {
  const group = getGroupForPermission(permissionCode);
  if (!group) return true;
  if (group.gateCode === permissionCode) return true; // gate is always selectable
  const gatePermission = group.codes.find((c) => c === group.gateCode);
  if (!gatePermission) return true;
  const gateId = Array.from(codeById.entries()).find(([, code]) => code === gatePermission)?.[0];
  return gateId ? selectedIds.has(gateId) : true;
}
