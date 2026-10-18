import { ISidebarBrand, IUser, MenuItem } from "./types";
import {
  Activity,
  Box,
  Diamond,
  GalleryVerticalEnd,
  Glasses,
  Handshake,
  Headset,
  LayoutDashboard,
  MapPinHouse,
  Newspaper,
  Palette,
  Rss,
  ScanText,
  Shapes,
  ShieldCheck,
  ShoppingCart,
  Skull,
  SquareStack,
  SunMedium,
  Tag,
  UsersRound,
  Video,
  View,
} from "lucide-react";

export const sidebarData: {
  user: IUser | null;
  brand: ISidebarBrand;
  menus: MenuItem[];
} = {
  user: null,
  brand: {
    name: "Akku Ka Chasma",
    logo: Glasses,
    website: {
      url:
        process.env.NODE_ENV === "production"
          ? "https://akkukachasma.com/"
          : "http://localhost:3000/",
      label: "visit website",
    },
  },
  menus: [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      url: "/manage",
      permission: "dashboard:view",
    },
    {
      icon: Box,
      title: "Orders",
      url: "/manage/orders",
      permission: "orders:list",
    },
    {
      icon: ShoppingCart,
      title: "Products",
      url: "/manage/products",
      permission: "products:list",
    },
    {
      icon: SunMedium,
      title: "Power Types",
      url: "/manage/power-types",
      permission: "catalog:manage",
    },
    {
      icon: View,
      title: "Lense Features",
      url: "/manage/lens-features",
      permission: "catalog:manage",
    },
    {
      icon: ScanText,
      title: "Lens Details",
      url: "/manage/lens-details",
      permission: "catalog:manage",
    },
    {
      icon: Shapes,
      title: "Frame Matarials",
      url: "/manage/frame-materials",
      permission: "catalog:manage",
    },
    {
      icon: Diamond,
      title: "Brands",
      url: "/manage/brands",
      permission: "catalog:manage",
    },
    {
      icon: Skull,
      title: "Shapes",
      url: "/manage/shapes",
      permission: "catalog:manage",
    },
    {
      icon: SquareStack,
      title: "Categories",
      url: "/manage/categories",
      permission: "catalog:manage",
    },
    {
      icon: Palette,
      title: "Colors",
      url: "/manage/colors",
      permission: "catalog:manage",
    },
    {
      icon: Tag,
      title: "Coupon Manager",
      url: "/manage/coupon-manager",
      permission: "catalog:manage",
    },
    {
      icon: Rss,
      title: "Articles",
      url: "/manage/articles",
      permission: "catalog:manage",
    },
    {
      icon: Newspaper,
      title: "Newsletters",
      url: "/manage/received-newsletters",
      permission: "catalog:manage",
    },
    {
      icon: GalleryVerticalEnd,
      title: "Banner Manager",
      url: "/manage/banners",
      permission: "catalog:manage",
    },
    {
      icon: Video,
      title: "Homepage hero media",
      url: "/manage/hero-home-media",
      permission: "hero-media:manage",
    },
    {
      icon: UsersRound,
      title: "Users",
      url: "/manage/users",
      permission: "users:list",
    },
    {
      icon: ShieldCheck,
      title: "Roles",
      url: "/manage/roles",
      permission: "users:list",
    },
    {
      icon: MapPinHouse,
      title: "Try At Home",
      url: "/manage/try-at-home",
      permission: "orders:list",
    },
    {
      icon: Handshake,
      title: "Franchises",
      url: "/manage/franchises",
      permission: "settings:manage",
    },
    {
      icon: Headset,
      title: "Inquiries",
      url: "/manage/enquiries",
      permission: "settings:manage",
    },
    {
      icon: Activity,
      title: "Activities",
      url: "/manage/activities",
      permission: "activities:list",
    },
  ],
};
