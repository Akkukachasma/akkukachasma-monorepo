import * as fs from 'fs';
import * as path from 'path';
import { PERMISSIONS, ROLE_PERMISSIONS } from './constants';

describe('PERMISSIONS', () => {
  it('includes hero media and product embedding codes', () => {
    expect(PERMISSIONS.HERO_MEDIA_VIEW).toBe('hero-media:view');
    expect(PERMISSIONS.HERO_MEDIA_MANAGE).toBe('hero-media:manage');
    expect(PERMISSIONS.PRODUCT_EMBEDDING_VIEW).toBe('product-embedding:view');
    expect(PERMISSIONS.PRODUCT_EMBEDDING_MANAGE).toBe('product-embedding:manage');
  });

  it('grants admin role all permission constants', () => {
    const all = Object.values(PERMISSIONS);
    for (const code of all) {
      expect(ROLE_PERMISSIONS.admin).toContain(code);
    }
  });

  it('does not grant customer hero or embedding permissions', () => {
    expect(ROLE_PERMISSIONS.customer).not.toContain(PERMISSIONS.HERO_MEDIA_MANAGE);
    expect(ROLE_PERMISSIONS.customer).not.toContain(
      PERMISSIONS.PRODUCT_EMBEDDING_MANAGE,
    );
  });
});

describe('permission seeds', () => {
  const seedsDir = path.join(__dirname, '../../prisma/seeds');

  it('permissions.json defines hero and embedding codes', () => {
    const raw = fs.readFileSync(
      path.join(seedsDir, 'permissions.json'),
      'utf-8',
    );
    const data = JSON.parse(raw) as Record<string, unknown>;
    expect(data).toHaveProperty('hero-media:view');
    expect(data).toHaveProperty('hero-media:manage');
    expect(data).toHaveProperty('product-embedding:view');
    expect(data).toHaveProperty('product-embedding:manage');
  });

  it('system-roles.json grants staff embedding and hero permissions', () => {
    const raw = fs.readFileSync(
      path.join(seedsDir, 'system-roles.json'),
      'utf-8',
    );
    const data = JSON.parse(raw) as {
      staff: { permissions: string[] };
    };
    expect(data.staff.permissions).toEqual(
      expect.arrayContaining([
        'hero-media:view',
        'hero-media:manage',
        'product-embedding:view',
        'product-embedding:manage',
      ]),
    );
  });
});
