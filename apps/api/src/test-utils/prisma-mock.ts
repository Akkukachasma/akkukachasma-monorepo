import { PrismaService } from '../prisma/prisma.service';

/** Common Prisma delegate methods used in unit tests. */
export function createPrismaDelegateMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };
}

export type PrismaDelegateMock = ReturnType<typeof createPrismaDelegateMock>;

/**
 * Minimal PrismaService-shaped mock for Nest `TestingModule`.
 * Override per test, e.g. `mock.order.findUnique.mockResolvedValue(...)`.
 */
export function createPrismaServiceMock(
  overrides: Partial<Record<string, unknown>> = {},
): PrismaService {
  const delegate = () => createPrismaDelegateMock();

  const base = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((arg: unknown) =>
      typeof arg === 'function'
        ? (arg as (tx: unknown) => unknown)(base)
        : Promise.all(arg as Promise<unknown>[]),
    ),
    $executeRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    cart: delegate(),
    cartItem: delegate(),
    order: delegate(),
    orderItem: delegate(),
    user: delegate(),
    productColor: delegate(),
    coupon: delegate(),
    address: delegate(),
    payment: delegate(),
    invoice: delegate(),
    ...overrides,
  };

  return base as unknown as PrismaService;
}
