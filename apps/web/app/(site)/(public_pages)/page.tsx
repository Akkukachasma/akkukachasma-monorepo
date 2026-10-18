export const dynamic = "force-dynamic";
import { Metadata } from "next";
import CategorySlider from "@/components/home/CategorySlider";
import EyeglassTrends from "@/components/home/home-section/EyeglassTrends";
import {
  fetchFeaturedProducts,
  fetchLatestProducts,
  fetchPopularProducts,
  fetchShapeStarters,
} from "@/services/product.service";
import ProductSlider from "@/components/home/home-section/ProductsSlider";
import HomeGallery from "@/components/home/home-section/HomeGallery";
import { fetchHomePageBanners } from "@/services/banner.service";
import BannerRenderer from "@/components/banner-renderer";
import { HeroSearchBar } from "@/features/hero-search";
import { IBanner } from "@/components/banners/ListItem";
import { cookies } from "next/headers";
import { TOKENS } from "@/lib/constants";
import { HeroMediaRenderer } from "@/components/home/hero-media-renderer";

export const metadata: Metadata = {
  title: "Akku Ka Chasma",
  description: `Akku ka Chasma gives you Eyeglasses | Contact lenses | Sunglasses service Since 2013 India
  Click or call we fix all online/offline in India`,
  keywords: [
    "eyewear",
    "eyeglasses",
    "akku",
    "akkukachasma",
    "trending eyewear",
  ],
  openGraph: {
    title: "Akku Ka Chasma",
    description: `Akku ka Chasma gives you Eyeglasses | Contact lenses | Sunglasses service Since 2013 India
    Click or call we fix all online/offline in India`,
    url: "https://akkukachasma.com",
    siteName: "Home | Akku Ka Chasma",
    type: "website",
  },
};

const HomePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKENS.AUTH_TOKEN)?.value;
  const listOpts = token ? { token } : undefined;

  const [shapeStartersResult, featuredResult, popularResult, latestResult, bannersResult] =
    await Promise.allSettled([
      fetchShapeStarters(),
      fetchFeaturedProducts(listOpts),
      fetchPopularProducts(listOpts),
      fetchLatestProducts(listOpts),
      fetchHomePageBanners(),
    ]);

  const shapeStarters =
    shapeStartersResult.status === "fulfilled" && Array.isArray(shapeStartersResult.value)
      ? shapeStartersResult.value
      : [];
  const featuredProducts =
    featuredResult.status === "fulfilled" && Array.isArray(featuredResult.value)
      ? featuredResult.value
      : [];
  const popularProducts =
    popularResult.status === "fulfilled" && Array.isArray(popularResult.value)
      ? popularResult.value
      : [];
  const latestProducts =
    latestResult.status === "fulfilled" && Array.isArray(latestResult.value)
      ? latestResult.value
      : [];
  const bannerList =
    bannersResult.status === "fulfilled" &&
      bannersResult.value &&
      typeof bannersResult.value === "object" &&
      Array.isArray(bannersResult.value?.data)
      ? bannersResult.value.data
      : [];

  // Assign banners to "between" slots only when the next section renders.
  // Skipped banners shift to the remaining pool.
  let bannerIndex = 0;
  const bannerBeforeFeatured =
    featuredProducts.length > 0 && bannerList[bannerIndex]
      ? bannerList[bannerIndex++]
      : null;
  const bannerBeforeNewArrivals =
    latestProducts.length > 0 && bannerList[bannerIndex]
      ? bannerList[bannerIndex++]
      : null;
  const bannerBeforePopular =
    popularProducts.length > 0 && bannerList[bannerIndex]
      ? bannerList[bannerIndex++]
      : null;
  const remainingBanners = bannerList.slice(bannerIndex);

  return (
    <div>
      <div className="relative min-h-96 px-4 py-8">
        <HeroMediaRenderer />
      </div>



      <CategorySlider />
      <EyeglassTrends data={shapeStarters || []} />

      {bannerBeforeFeatured && (
        <BannerRenderer banner={bannerBeforeFeatured} layout="home" />
      )}

      {featuredProducts.length > 0 && (
        <ProductSlider
          title="Featured"
          subtitle="Products"
          data={featuredProducts}
        />
      )}

      {bannerBeforeNewArrivals && (
        <BannerRenderer banner={bannerBeforeNewArrivals} layout="home" />
      )}

      {latestProducts.length > 0 && (
        <ProductSlider title="New" subtitle="Arrivals" data={latestProducts} />
      )}

      {bannerBeforePopular && (
        <BannerRenderer banner={bannerBeforePopular} layout="home" />
      )}

      {popularProducts.length > 0 && (
        <ProductSlider
          title="Popular"
          subtitle="Products"
          data={popularProducts}
        />
      )}

      {remainingBanners.map((banner: IBanner) => (
        <BannerRenderer key={banner.id} banner={banner} layout="home" />
      ))}

      <HomeGallery />
    </div>
  );
};
export default HomePage;
