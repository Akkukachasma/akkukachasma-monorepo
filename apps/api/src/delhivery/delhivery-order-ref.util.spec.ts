import {
  buildDelhiveryOrderRef,
  formatSellerInvDate,
  parseOrderIdFromDelhiveryRef,
  sanitizeInvoiceForDelhivery,
} from './delhivery-order-ref.util';

describe('delhivery-order-ref.util', () => {
  describe('sanitizeInvoiceForDelhivery', () => {
    it('replaces slashes and strips forbidden chars', () => {
      expect(sanitizeInvoiceForDelhivery('AKC/26-27/29')).toBe('AKC-26-27-29');
      expect(sanitizeInvoiceForDelhivery('AKC/26-27/29#A%')).toBe(
        'AKC-26-27-29A',
      );
    });
  });

  describe('buildDelhiveryOrderRef', () => {
    it('returns plain order id when invoice missing', () => {
      expect(buildDelhiveryOrderRef('order123', null)).toBe('order123');
      expect(buildDelhiveryOrderRef('order123', '')).toBe('order123');
    });

    it('builds composite ref with sanitized invoice', () => {
      expect(buildDelhiveryOrderRef('order123', 'AKC/26-27/29')).toBe(
        'order123__AKC-26-27-29',
      );
    });
  });

  describe('parseOrderIdFromDelhiveryRef', () => {
    it('returns legacy plain ReferenceNo unchanged', () => {
      expect(parseOrderIdFromDelhiveryRef('6a6521b1c336e369664dff48')).toBe(
        '6a6521b1c336e369664dff48',
      );
    });

    it('extracts order id from composite ReferenceNo', () => {
      expect(
        parseOrderIdFromDelhiveryRef(
          '6a6521b1c336e369664dff48__AKC-26-27-29',
        ),
      ).toBe('6a6521b1c336e369664dff48');
    });
  });

  describe('formatSellerInvDate', () => {
    it('formats issued date as YYYY-MM-DD', () => {
      expect(formatSellerInvDate(new Date('2026-07-26T10:00:00.000Z'))).toBe(
        '2026-07-26',
      );
    });
  });
});
