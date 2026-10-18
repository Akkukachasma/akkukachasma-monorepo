import { Metadata } from "next";
import { WishlistView } from "@/features/wishlist";

export const metadata: Metadata = {
  title: "My Wishlist | Akku Ka Chasma",
  description:
    "View and manage your saved eyewear items from Akku Ka Chasma. Find your favorite eyeglasses, sunglasses, and contact lenses all in one place.",
  keywords: [
    "wishlist",
    "saved items",
    "favorite eyewear",
    "akku ka chasma wishlist",
    "eyeglasses wishlist",
    "sunglasses collection",
    "saved for later",
  ],
  openGraph: {
    title: "My Wishlist | Akku Ka Chasma",
    description:
      "View and manage your saved eyewear items from Akku Ka Chasma. Find your favorite eyeglasses, sunglasses, and contact lenses all in one place.",
    url: "https://akkukachasma.com/wishlist",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
};

const WishlistPage = () => {
  return <WishlistView />;
};

export default WishlistPage;
