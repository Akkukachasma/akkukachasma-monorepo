/** Logical keys for invoice tax rule cache (service-layer, not HTTP interceptor). */
export const invoiceTaxKeys = {
  prefix: 'invoiceTax:' as const,
  byCategory: (categoryId: string) => `invoiceTax:cat:${categoryId}`,
  general: () => 'invoiceTax:general',
};
