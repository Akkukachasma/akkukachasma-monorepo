import { IColor } from "@/components/colors/ListItem";
import { IProductFile } from "@/components/products/details/product-color-images/ColorImages";
import { LucideProps } from "lucide-react";
import * as React from "react";
import { FrameStyle } from "./validations/admin/product.validation";
import { IProduct } from "@/components/products/ListItem";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type IconElement = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export interface IPaginatedResponse<T> {
  data: T[];
  success: boolean;
  total: number;
  page: number;
  page_size: number;
}

/** Available filter options for category products */
export interface ICategoryProductFilters {
  frame_styles?: string[];
  genders?: string[];
  frame_sizes?: string[];
  frame_widths?: number[];
  lens_widths?: number[];
  shapes?: Array<{ id: string; title: string }>;
  frame_materials?: Array<{ id: string; title: string }>;
  colors?: Array<{ id: string; color: string; name?: string | null }>;
}

/** Category products API response (includes available filters) */
export interface ICategoryProductsResponse<T> extends IPaginatedResponse<T> {
  filters?: ICategoryProductFilters;
}

export interface IRecordMeta {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface IFile {
  id: string;
  url: string;
  fieldname: string;
  is_temp?: boolean;
}
export interface IUser {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  avatar?: IFile;
  /** Role codes from user_roles (e.g. ['customer'], ['admin']). */
  roles?: string[];
  /** Permission codes from roles (for sidebar filtering, PermissionGuard). */
  permissions?: string[];
}

export interface ISearchTerm {
  query: string;
  query_string: string;
}

export interface IDefaultUrl {
  default_url?: string;
}
export interface IWrapper {
  children: React.ReactNode;
}

export interface IDeleteRecord<T = any> {
  id: string;
  label: string;
  data?: T;
}

export type FileType = {
  id: string;
  key?: string;
  fieldname?: string;
  url: string;
};

export interface InputOption {
  value?: string;
  label?: string;
}

export interface IconInterface extends React.SVGProps<SVGSVGElement> {}
export interface IOwner {
  id: string;
  name: string;
  created_at: Date;
  account_verified: Date | null;
  email: string;
  email_verified: Date | null;
  phone_number: string;
  company_name: string;
  avatar: FileType;
}
export interface IFormOption {
  id: string;
  type: string;
  label: string;
  xero_key?: string;
  myob_key?: string;
  _count: { [key: string]: number };
}

export interface ISidebarBrand {
  name: string;
  logo: React.ElementType;
  website: {
    url: string;
    label: string;
  };
}

export interface SubMenuItem {
  icon?: IconElement;
  title: string;
  url: string;
  isActive?: boolean;
  permission?: string;
}
export interface MenuItem {
  title: string;
  url: string;
  icon: IconElement;
  isActive?: boolean;
  permission?: string | string[];
  items?: SubMenuItem[];
}
export type ProductColorEmbeddingKind = "video" | "embed";

export type EmbedProvider =
  | "youtube"
  | "vimeo"
  | "instagram"
  | "facebook"
  | "unknown"
  | null;

export interface IProductColorEmbedding {
  id: string;
  product_color_id: string;
  sort_order: number;
  kind: ProductColorEmbeddingKind;
  embed_code: string | null;
  embed_provider: EmbedProvider;
  iframe_src: string | null;
  file_id: string | null;
  content_type: string | null;
  cache_version: string;
  stream_path: string | null;
}

export interface IProductColor extends IRecordMeta {
  colors: IColor[];
  product_id: string;
  model_number: string;
  stock_quantity: number;
  images: IProductFile[];
  popularity?: { score: number } | null;
  embeddings?: IProductColorEmbedding[];
}

export interface IGlasses {
  src: string;
  title: string;
}

export interface IGlassTypeData {
  src: string;
  title: string;
}

export interface IProductStarter {
  title: string;
  slug: string;
  products: {
    price: number;
    listing_price: number;
    discount_percent: number;
    product_colors: { images: IFile[] }[];
  }[];
}

export interface ISeparatedProduct extends IRecordMeta {
  model_number: string;
  stock_quantity: number;
  color_ids: string[];
  product_id: string;
  product: Omit<IProduct, "product_colors", "frame_material", "power_types">;
  colors: IColor[];
  images: IProductFile[];
  popularity?: { score: number } | null;
  /** Set by public product listing APIs when the user is signed in. */
  is_wishlisted?: boolean;
}
