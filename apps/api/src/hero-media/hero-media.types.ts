import { HeroMediaType } from '@prisma/client';

export type HeroMediaKind = 'image' | 'video' | 'unknown';

export type HeroMediaFileDto = {
  id: string;
  media_kind: HeroMediaKind;
  mime_type: string | null;
  url: string | null;
  stream_path: string | null;
  sort_order: number;
};

export type HeroActiveMetadataDto = {
  has_media: boolean;
  /** @deprecated Use has_media — kept for older storefront builds */
  hasVideo: boolean;
  type: HeroMediaType | null;
  cache_version: string | null;
  title: string | null;
  files: HeroMediaFileDto[];
  /** First video stream path (legacy) */
  streamPath?: string;
  /** First video mime (legacy) */
  contentType?: string | null;
};

export function mimeToMediaKind(mime: string | null | undefined): HeroMediaKind {
  const m = (mime ?? '').toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  return 'unknown';
}
