const S3_BASE = 'https://akkukachasmanew.s3.ap-south-1.amazonaws.com/public';

export const S3_ASSETS = {
  // Root assets
  LOGO: `${S3_BASE}/Logo.png`,
  HERO_VIDEO: `${S3_BASE}/hero-video.mp4`,
  AUTH_BANNER: `${S3_BASE}/auth-banner.png`,
  BANNER5: `${S3_BASE}/banner5.png`,
  CHASMA: `${S3_BASE}/chasma.png`,
  CHECK_GIF: `${S3_BASE}/check.gif`,
  FAILED_GIF: `${S3_BASE}/failed.gif`,
  AVIATOR: `${S3_BASE}/aviator.jpg`,
  LENS_ONLY: `${S3_BASE}/lens-only.png`,

  // images/ folder
  img: (filename: string) => `${S3_BASE}/images/${filename}`,
} as const;
