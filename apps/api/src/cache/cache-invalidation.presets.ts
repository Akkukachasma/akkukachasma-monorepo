/**
 * GET invalidation patterns for {@link InvalidateCache}.
 * Format: METHOD:pathGlob (without `/v1`; interceptor adds GLOBAL_PREFIX).
 */

export const INVALIDATE_ON_AUTH_MUTATION: string[] = [
  'GET:/auth*',
  'GET:/users*',
  'GET:/account*',
];

export const INVALIDATE_ON_ACCOUNT_MUTATION: string[] = [
  ...INVALIDATE_ON_AUTH_MUTATION,
];

export const INVALIDATE_ON_USER_MUTATION: string[] = [
  'GET:/users*',
  'GET:/auth*',
  'GET:/roles*',
];

export const INVALIDATE_ON_ROLE_MUTATION: string[] = [
  'GET:/roles*',
  'GET:/users*',
];

export const INVALIDATE_ON_ADDRESS_MUTATION: string[] = ['GET:/addresses*'];

export const INVALIDATE_ON_PRODUCT_MUTATION: string[] = [
  'GET:/products*',
  'GET:/product-colors*',
  'GET:/dashboard*',
  'GET:/popularity*',
];

export const INVALIDATE_ON_CATEGORY_MUTATION: string[] = [
  'GET:/categories*',
  'GET:/products*',
];

export const INVALIDATE_ON_BRAND_MUTATION: string[] = [
  'GET:/brands*',
  'GET:/products*',
];

export const INVALIDATE_ON_COLOR_MUTATION: string[] = [
  'GET:/colors*',
  'GET:/products*',
];

export const INVALIDATE_ON_SHAPE_MUTATION: string[] = [
  'GET:/shapes*',
  'GET:/products*',
];

export const INVALIDATE_ON_CART_MUTATION: string[] = ['GET:/cart*'];

export const INVALIDATE_ON_ORDER_MUTATION: string[] = [
  'GET:/orders*',
  'GET:/dashboard*',
];

export const INVALIDATE_ON_BANNER_MUTATION: string[] = [
  'GET:/banners*',
  'GET:/banner-images*',
];

export const INVALIDATE_ON_SETTING_MUTATION: string[] = [
  'GET:/taxes*',
  'GET:/company-info*',
  'GET:/settings*',
];

export const INVALIDATE_ON_WISHLIST_MUTATION: string[] = ['GET:/wishlist*'];

export const INVALIDATE_ON_COUPON_MUTATION: string[] = ['GET:/coupons*'];

export const INVALIDATE_ON_HERO_MEDIA_MUTATION: string[] = ['GET:/hero-media*'];

export const INVALIDATE_ON_DASHBOARD_MUTATION: string[] = ['GET:/dashboard*'];

export const INVALIDATE_ON_ARTICLE_MUTATION: string[] = ['GET:/articles*'];

export const INVALIDATE_ON_INQUIRY_MUTATION: string[] = ['GET:/inquiries*'];

export const INVALIDATE_ON_POWER_TYPE_MUTATION: string[] = [
  'GET:/power-types*',
  'GET:/products*',
];

export const INVALIDATE_ON_LENS_FEATURE_MUTATION: string[] = [
  'GET:/lens-features*',
  'GET:/products*',
];

export const INVALIDATE_ON_LENS_DETAIL_MUTATION: string[] = [
  'GET:/lens-details*',
  'GET:/products*',
];

export const INVALIDATE_ON_FRAME_MATERIAL_MUTATION: string[] = [
  'GET:/frame-materials*',
  'GET:/products*',
];
