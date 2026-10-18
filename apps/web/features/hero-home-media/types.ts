export type HeroMediaKind = "image" | "video" | "unknown";

export type HeroMediaType = "BANNER" | "SLIDER";

export type HeroMediaFile = {
  id: string;
  media_kind: HeroMediaKind;
  mime_type: string | null;
  url: string | null;
  stream_path: string | null;
  sort_order: number;
};

export type HeroActiveMedia = {
  has_media: boolean;
  /** @deprecated Use has_media */
  hasVideo?: boolean;
  type: HeroMediaType | null;
  cache_version: string | null;
  title: string | null;
  files: HeroMediaFile[];
  streamPath?: string;
  contentType?: string | null;
};
