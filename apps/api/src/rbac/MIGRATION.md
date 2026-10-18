# RBAC Migration Strategy

## Current state

- **AuthGuard:** Validates JWT, attaches `request.user` (full User from Prisma).
- **RolesGuard:** Reads `@Roles(...UserTypes[])`, allows if `user.type` is in the list.
- **@Roles('admin' | 'customer'):** Used on many controller methods.
- **Ownership:** Enforced in services (e.g. `orderService.fetchOrderById(id, tenant.id)`).

## Target state

- **AuthGuard:** Unchanged.
- **PermissionGuard:** Reads `@RequirePermissions(...)`, allows if user's role grants at least one permission.
- **OwnershipGuard:** Reads `@CheckOwnership({ resourceType, paramKey })`, allows if user owns resource or is admin (role-based bypass).
- **No `@Roles`** on migrated routes; use **@RequirePermissions** and **@CheckOwnership** instead.
- **No role or ownership checks inside services;** all authorization at guard level.

## Step-by-step migration

### 1. RbacModule is already integrated

- RbacModule is global; PermissionGuard and OwnershipGuard are registered as APP_GUARD.
- Guards no-op when no metadata is set, so existing routes keep working.

### 2. Migrate one resource (Order) as template

- **Done:** Order ownership resolver registered in OrderModule; `GET /orders/:id` uses `@RequirePermissions` + `@CheckOwnership` instead of `@Roles('admin')`.
- **Pattern for other order endpoints:**
  - Admin-only (e.g. list all, update status): `@RequirePermissions(PERMISSIONS.ORDERS_LIST)` or `PERMISSIONS.ORDER_UPDATE`; no `@CheckOwnership` (or add ownership where resource is single; admin bypasses by role).
  - Customer-only, own resource: `@RequirePermissions(PERMISSIONS.ORDER_VIEW)` + `@CheckOwnership({ resourceType: ORDER_RESOURCE_TYPE, paramKey: 'id' })`; admin bypasses ownership.
  - Remove `@Roles(...)` from migrated handlers to avoid duplicate checks.

### 3. Migrate remaining Order endpoints

- Replace `@Roles('admin')` with `@RequirePermissions(<appropriate permission>)`.
- Replace `@Roles('customer')` + in-service ownership check with `@RequirePermissions` + `@CheckOwnership` where the handler is "customer can only touch own resource".
- Leave service logic unchanged; remove any `tenant.id` filtering that was only for ownership (guard now enforces it).

### 4. Add ownership resolvers for other resources

- **Cart:** Register resolver for `cart` (owner = cart.user_id). Use param key that identifies cart (e.g. from body or derived from user).
- **Address, Prescription, Wishlist:** Same idea: resolver returns `user_id` for the resource; guard checks ownership.
- **Product:** If "seller" role is added later, resolver can return product.user_id for `product:update` + ownership.

### 5. Migrate other modules (User, Product, Cart, etc.)

- Add `@RequirePermissions` using constants from `rbac/constants`.
- Add `@CheckOwnership` where access is "own resource only".
- Register ownership resolvers in each domain module's `onModuleInit`.

### 6. Remove RolesGuard and @Roles

- When all routes use `@RequirePermissions` (and optionally `@CheckOwnership`), remove RolesGuard from APP_GUARD and delete or deprecate `@Roles` and RolesGuard.
- Keep AuthGuard; keep PermissionGuard and OwnershipGuard.

### 7. Add new roles (seller, support)

- Add role key to `ROLE_PERMISSIONS` in `rbac/constants.ts` with the right permissions.
- Ensure User model has a way to store role (e.g. extend UserTypes enum or keep mapping from `user.type`).
- No changes to guards; they already resolve permissions from role.

## Checklist per endpoint

- [ ] Replace `@Roles(X)` with `@RequirePermissions(PERMISSIONS.<X>)`.
- [ ] If "customer can only access own resource", add `@CheckOwnership({ resourceType, paramKey })` and register resolver if not already.
- [ ] Admin bypasses ownership by role; no special permission needed. Use `@RequirePermissions` + `@CheckOwnership`; OwnershipGuard allows admin automatically.
- [ ] Remove any `if (user.type === 'admin')` or ownership checks from the service for that endpoint.
- [ ] Leave business logic (e.g. "cannot update order after confirmed") in the service; only authorization moves to guards.
