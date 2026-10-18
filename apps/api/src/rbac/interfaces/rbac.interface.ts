/**
 * Core RBAC abstractions. No dependency on domain entities (Order, Product, etc.).
 */

/** User identity as seen by RBAC (from request.user). Must have id and a role. */
export interface IRbacUser {
  id: string;
  /** Role code from DB used to resolve permissions (e.g. 'admin', 'customer'). */
  role: string;
}

/** Context passed to permission/policy evaluation. */
export interface IPermissionContext {
  user: IRbacUser;
  /** Optional: resource type and id for ownership checks. */
  resource?: { resourceType: string; resourceId: string };
}

/** Resolves owner user id for a resource. Registered per resource type. */
export interface IOwnershipResolver {
  getOwnerId(resourceType: string, resourceId: string): Promise<string | null>;
}

/** Options for @CheckOwnership decorator. */
export interface ICheckOwnershipOptions {
  /** Resource type (e.g. 'order', 'product'). */
  resourceType: string;
  /** Request param key that holds the resource id (e.g. 'id', 'orderId'). */
  paramKey: string;
}

/** Policy evaluator: given context, returns whether access is allowed. */
export type PolicyFn = (context: IPermissionContext) => Promise<boolean> | boolean;
