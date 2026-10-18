import { ISidebarBrand, MenuItem } from "@/lib/types";
import {
  Bell,
  FileText,
  Glasses,
  Handshake,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Newspaper,
  Package,
  PackageSearch,
  Settings,
  Shield,
  ShoppingCart,
  Headset,
  Sparkles,
} from "lucide-react";

export const customerSidebarData: {
  brand: ISidebarBrand;
  sections: MenuItem[][];
} = {
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
  sections: [
    [
      { icon: LayoutDashboard, title: "Account", url: "/customers/account" },
      { icon: Package, title: "Orders", url: "/customers/orders" },
      { icon: MapPin, title: "Addresses", url: "/customers/addresses" },
      {
        icon: FileText,
        title: "Prescriptions",
        url: "/customers/prescriptions",
      },
      { icon: Shield, title: "Security", url: "/customers/security" },
      {
        icon: Bell,
        title: "Notifications",
        url: "/customers/notifications",
      },
      { icon: Settings, title: "Settings", url: "/customers/settings" },
    ],
    [
      { icon: Home, title: "Home", url: "/" },
      { icon: LayoutGrid, title: "Categories", url: "/categories" },
      { icon: Heart, title: "Wishlist", url: "/wishlist" },
      { icon: ShoppingCart, title: "Cart", url: "/cart" },
    ],
    [
      { icon: Sparkles, title: "Try@Home", url: "/try-at-home" },
      { icon: Newspaper, title: "Blog", url: "/blog" },
      { icon: Headset, title: "Support", url: "/support" },
      { icon: Info, title: "About", url: "/about-us" },
      { icon: Handshake, title: "Franchise", url: "/franchise-enquiry" },
      { icon: PackageSearch, title: "Track order", url: "/track-order" },
    ],
  ],
};

/** Account section only — used by AccountShell (`/customers/*`). */
export const customerAccountNav = customerSidebarData.sections[0];

export const storefrontNavLinks = [
  { href: "/try-at-home", label: "Try@Home" },
  { href: "/franchise-enquiry", label: "Franchise" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
  { href: "/about-us", label: "About" },
] as const;
