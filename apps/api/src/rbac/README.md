# RBAC Architecture

## 1. Roles vs Permissions vs Policies vs Ownership

### Roles
- **What:** Named groupings of users (e.g. `admin`, `customer`, `support`). Stored on the user (e.g. `User.type`).
- **Use:** Roles are mapped to **permissions**. We never check `user.role === 'admin'` in business logic; we check permissions or policies.

### Permissions
- **What:** Atomic actions expressed as strings, e.g. `order:read`, `order:create`, `product:update`, `order:read_any`.
- **Use:** Guards and policies evaluate “does this user have permission X?”. Permissions are **role-derived** (via a role–permission map) and optionally **attribute-based** (e.g. ownership).

### Policies
- **What:** Reusable rules that combine permissions and conditions. Examples:
  - “Allow if user has `order:read_any`” (admin).
  - “Allow if user has `order:read` **and** user owns the resource.”
- **Use:** A guard runs a **policy evaluator** that resolves the user’s permissions (from role) and optional ownership, then allows/denies. No `if (user.role === …)` in services.

### Ownership
- **What:** “This user owns this resource.” Resource-level authorization (e.g. “user A owns order X”).
- **Use:** Implemented via an **ownership resolver**: given `(resourceType, resourceId)` return `ownerUserId`. The RBAC layer compares `request.user.id` to that. Domain modules register resolvers (e.g. Order module: for resource type `order`, resolve owner from `Order.user_id`).

### Flow (high level)
1. **Authentication** (existing AuthGuard): Attach `request.user`.
2. **Authorization (RBAC):**
   - **Permission guard:** “Require permission(s) X.” Resolves user’s permissions from role; allows if any required permission is present.
   - **Ownership guard:** “Require that the user owns the resource identified by param.” Uses resolver to get owner id; allows if `user.id === ownerId`.
   - **Policy guard:** “Require that policy P passes.” Policy can require permission + ownership, or more complex conditions.

Combining decorators: `@RequirePermissions(PERMISSIONS.ORDER_VIEW)` + `@CheckOwnership({ resourceType: 'order', paramKey: 'id' })` → customer can view only their order; admin bypasses ownership by role.

---

## 2. Module Structure and Folder Layout

```
src/rbac/
├── README.md                    # This file
├── rbac.module.ts
├── constants.ts                 # Permission strings, role–permission map
├── interfaces/
│   ├── index.ts
│   └── rbac.interface.ts        # IPermissionContext, IOwnershipResolver, etc.
├── decorators/
│   ├── index.ts
│   ├── require-permissions.decorator.ts
│   ├── check-ownership.decorator.ts
│   └── require-policies.decorator.ts
├── guards/
│   ├── index.ts
│   ├── permission.guard.ts
│   ├── ownership.guard.ts
│   └── policy.guard.ts
└── services/
    ├── index.ts
    ├── policy-evaluator.service.ts   # Resolves role → permissions; evaluates policies
    └── ownership-resolver.registry.ts # Register/get ownership resolvers per resource type
```

- **No** domain models (Order, Product, etc.) imported in core RBAC. Domain modules register ownership resolvers and use decorators/guards.
- **Auth** stays in AuthModule; RBAC consumes `request.user` (must have at least `id` and a way to get “role”, e.g. `type`).

---

## 3. Core Abstractions (Interfaces/Types)

- **IPermissionContext:** `{ userId, role, permissions? }` — what the evaluator needs.
- **IOwnershipResolver:** `(resourceType, resourceId) => Promise<string | null>` — returns owner user id.
- **OwnershipResolverRegistry:** Register/get resolver by resource type.
- **Policy:** Optional interface for named policies (e.g. “order.read” → require `order:read` + ownership if not `order:read_any`). Can start with inline logic in guards and extract later.

---

## 4. Custom Decorators

- **@RequirePermissions(...permissions: string[])**  
  Metadata: required permissions (any one of = allow). Used by PermissionGuard.

- **@CheckOwnership({ resourceType, paramKey })**  
  Metadata: which param holds resource id, which resource type. Used by OwnershipGuard.

- **@RequirePolicies(...policyNames: string[])**  
  Optional: named policies for PolicyGuard. Can be added when we introduce named policy definitions.

---

## 5. Guards and Policy Evaluator

- **PermissionGuard:** Reads @RequirePermissions, gets user from request, gets permissions for user’s role (via PolicyEvaluator), allows if user has at least one required permission.
- **OwnershipGuard:** Reads @CheckOwnership, gets resource id from param, calls OwnershipResolverRegistry.getOwnerId(resourceType, resourceId), allows if `request.user.id === ownerId`.
- **PolicyEvaluator:** Injects role–permission map; method `getPermissionsForRole(role): string[]`; optional `evaluate(policyName, context): boolean` for future policies.

Execution order: AuthGuard (1st) → PermissionGuard → OwnershipGuard (when both are applied).

---

## 6. Example Integration (Order)

- **OrderController** (example endpoints):
  - `GET /orders` (list): `@RequirePermissions(PERMISSIONS.ORDERS_LIST)`; list handler filters by owner for customer (or admin sees all).
  - `GET /orders/:id` (single): `@RequirePermissions(PERMISSIONS.ORDER_VIEW)` + `@CheckOwnership({ resourceType: 'order', paramKey: 'id' })` → admin or owner.
  - `POST /orders` (create): `@RequirePermissions(PERMISSIONS.ORDER_CREATE)` → customer.
- **OrderModule:** Registers ownership resolver for `order`: resolve order by id, return `order.user_id`.

No `if (user.type === 'admin')` in OrderService; ownership and role-based access are handled in guards.

---

## 7. Migration Strategy

1. **Introduce RbacModule** alongside existing AuthModule; keep AuthGuard and add PermissionGuard, OwnershipGuard (both run after AuthGuard).
2. **Define permissions and role–permission map** in RBAC constants; keep `User.type` as the “role” for now.
3. **Replace @Roles(...)** gradually with **@RequirePermissions(...)** on controllers; remove RolesGuard once migrated (or keep it as a thin wrapper that maps old roles to permissions).
4. **Add @CheckOwnership** where “customer can only access own resource” (orders, cart, address, etc.); register ownership resolvers in the corresponding domain modules.
5. **Leave services unchanged:** no role or permission checks inside services; all authorization at controller/guard level.
6. **Optional:** Introduce named policies (e.g. “order.read”) that encapsulate “order:read_any OR (order:read AND ownership)” and use @RequirePolicies for cleaner controllers.
