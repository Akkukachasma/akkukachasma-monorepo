export const dynamic = "force-dynamic";

import HeroSlider from "@/components/blog/PopularPosts";
import ArticleCard from "@/components/blog/ArticleCard";
import {
  fetchPopularArticles,
  fetchPublishedArticles,
} from "@/services/article.service";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Akku Ka Chasma",
  description: `Explore trending eyewear stories, eye care tips, and updates from Akku Ka Chasma. Discover expert articles, guides, and popular posts on eyeglasses, lenses, and more.`,
  keywords: [
    "eyewear blog",
    "eye care tips",
    "akku ka chasma blog",
    "eyeglasses articles",
    "popular eyewear posts",
    "sunglasses blog",
    "contact lens care",
  ],
  openGraph: {
    title: "Blog | Akku Ka Chasma",
    description: `Read our latest blog posts on eyeglasses, sunglasses, contact lenses, and more. Stay informed with popular insights and expert tips from Akku Ka Chasma.`,
    url: "https://akkukachasma.com/blog",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/blog",
  },
};

export default async function Page() {
  const popularArticles = await fetchPopularArticles();
  const publishedArticles = await fetchPublishedArticles();
  const list = publishedArticles?.data ?? [];
  const hasPopular = popularArticles.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-25%,hsl(var(--primary)/0.12),transparent)]"
          aria-hidden
        />
        <div className="app-container relative px-4 py-12 sm:py-14 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
              <BookOpen className="size-4 shrink-0" aria-hidden />
              Eyewear tips and stories
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Blog
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-sm text-muted-foreground sm:text-base">
              Short reads on eye care, frames, lenses, and what we&apos;re up
              to—no fluff, just useful notes.
            </p>
          </div>
        </div>
      </section>

      {hasPopular ? (
        <section className="border-b border-border/60 bg-muted/20">
          <div className="app-container px-4 py-10 md:py-14">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground text-center">
              Popular right now
            </h2>
            <div className="max-w-3xl mx-auto">
              <HeroSlider articles={popularArticles} height={600} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="app-container px-4 py-10 md:py-14 md:pb-16">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground text-center">
          Latest articles
        </h2>
        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            New posts will show up here soon.
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 md:gap-5">
            {list.map((article) => (
              <ArticleCard key={article.id} data={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
