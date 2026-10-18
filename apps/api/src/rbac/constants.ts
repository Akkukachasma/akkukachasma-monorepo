/**
 * Generalized permission codes: resource:action.
 * No read_any / special admin permissions; admin gets all. Ownership enforced separately.
 */

export const PERMISSIONS = {
  // Orders
  ORDERS_LIST: 'orders:list',
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',

  // Products
  PRODUCTS_LIST: 'products:list',
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Users
  USERS_LIST: 'users:list',
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Invoices
  INVOICES_LIST: 'invoices:list',
  INVOICE_VIEW: 'invoice:view',

  // Catalog, settings, dashboard
  CATALOG_MANAGE: 'catalog:manage',
  SETTINGS_MANAGE: 'settings:manage',
  DASHBOARD_VIEW: 'dashboard:view',

  // Activities (audit log)
  ACTIVITIES_LIST: 'activities:list',

  // Homepage hero video
  HERO_MEDIA_VIEW: 'hero-media:view',
  HERO_MEDIA_MANAGE: 'hero-media:manage',

  // Product color embeddings (PDP media)
  PRODUCT_EMBEDDING_VIEW: 'product-embedding:view',
  PRODUCT_EMBEDDING_MANAGE: 'product-embedding:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Fallback role→permissions when DB not used. Admin gets all; customer gets subset.
 * In production, roles/permissions come from DB (seeds assign admin = all).
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  customer: [
    PERMISSIONS.ORDERS_LIST,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.PRODUCTS_LIST,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVOICES_LIST,
    PERMISSIONS.INVOICE_VIEW,
  ],
};
