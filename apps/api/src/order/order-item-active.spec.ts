import { isActiveOrderLine } from './order-item-active';

describe('isActiveOrderLine', () => {
  it('treats missing admin_cancelled_at as active', () => {
    expect(isActiveOrderLine({})).toBe(true);
  });

  it('treats null as active', () => {
    expect(isActiveOrderLine({ admin_cancelled_at: null })).toBe(true);
  });

  it('treats set date as inactive', () => {
    expect(isActiveOrderLine({ admin_cancelled_at: new Date() })).toBe(false);
  });
});
