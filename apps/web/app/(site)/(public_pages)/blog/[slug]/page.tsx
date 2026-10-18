export const dynamic = "force-dynamic";

import ArticleViewTracker from "@/components/blog/ArticleViewTracker";
import BlogRelatedProductCard from "@/components/blog/BlogRelatedProductCard";
import TagsAndKeywords from "@/components/blog/TagsAndKeywords";
import { fetchArticleBySlug } from "@/services/article.service";
import type { IArticle } from "@/components/articles/ListItem";
import dayjs from "dayjs";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import MultiCardSlider from "@/components/ui/swiper/MultiCardSlider";

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

const getArticle = cache(async (slug: string): Promise<IArticle | null> => {
  try {
    return await fetchArticleBySlug(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    const guess = decodeURIComponent(slug.replace(/-/g, " "));
    return {
      title: `${guess} | Blog | Akku Ka Chasma`,
      description: `Read our blog post "${guess}" on Akku Ka Chasma.`,
    };
  }

  const title = article.seo_title?.trim() || article.title;
  const description =
    article.description?.trim() ||
    `Read "${article.title}" on the Akku Ka Chasma blog—eyewear tips, eye care, and product guides.`;

  const toIso = (value: unknown) => {
    if (value == null) return undefined;
    const d = new Date(value as string | number | Date);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  return {
    title: `${title} | Akku Ka Chasma`,
    description,
    keywords: [...article.tags, ...article.keywords].slice(0, 20),
    openGraph: {
      title: `${title} | Akku Ka Chasma`,
      description,
      url: `https://akkukachasma.com/blog/${article.slug}`,
      siteName: "Akku Ka Chasma",
      type: "article",
      publishedTime: toIso(article.created_at),
      modifiedTime: toIso(article.updated_at),
      images: article.thumbnail?.url
        ? [{ url: article.thumbnail.url, alt: article.thumbnail_alt || title }]
        : undefined,
    },
    twitter: {
      card: article.thumbnail?.url ? "summary_large_image" : "summary",
      title: `${title} | Akku Ka Chasma`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://akkukachasma.com/blog/${article.slug}`,
    },
  };
}

const BlogDetailsPage = async ({ params }: BlogDetailsPageProps) => {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const published = dayjs(article.updated_at || article.created_at).format(
    "MMMM D, YYYY",
  );
  const views = article.views ?? 0;
  const readTime = article.reading_time ?? 0;
  const thumbAlt = article.thumbnail_alt?.trim() || article.title;
  const hasTags =
    (article.tags?.length ?? 0) + (article.keywords?.length ?? 0) > 0;

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-background">
      <ArticleViewTracker slug={article.slug} />

      <div className="border-b border-border/60 bg-muted/20">
        <div className="app-container py-3 sm:py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to blog
          </Link>
        </div>
      </div>

      {article.thumbnail?.url ? (
        <div className="app-container pt-6 sm:pt-10 md:pt-12">
          <div className="relative mx-auto aspect-[16/10] max-h-[min(52vh,420px)] w-full max-w-4xl overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm sm:aspect-[2/1] sm:rounded-2xl">
            <Image
              src={article.thumbnail.url}
              alt={thumbAlt}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        </div>
      ) : null}

      <article className="app-container min-w-0 pb-10 pt-6 sm:pb-14 sm:pt-10 md:pt-12">
        <header className="relative mx-auto w-full min-w-0 max-w-3xl">
          <div
            className="pointer-events-none absolute -inset-x-4 -top-16 -z-10 hidden h-48 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,hsl(var(--primary)/0.08),transparent)] sm:-inset-x-20 sm:-top-24 sm:block"
            aria-hidden
          />
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl md:leading-tight">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 pb-5 text-sm text-muted-foreground sm:mt-6 sm:gap-x-6 sm:pb-6">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0 text-primary/70" aria-hidden />
              <time
                dateTime={String(article.updated_at || article.created_at)}
              >
                {published}
              </time>
            </span>
            <span
              className="hidden h-4 w-px bg-border sm:block"
              aria-hidden
            />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-primary/70" aria-hidden />
              {readTime} min read
            </span>
            <span
              className="hidden h-4 w-px bg-border sm:block"
              aria-hidden
            />
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4 shrink-0 text-primary/70" aria-hidden />
              {views.toLocaleString()} view{views === 1 ? "" : "s"}
            </span>
          </div>
        </header>

        <div
          className="article-container mx-auto w-full min-w-0 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div
          className={
            hasTags
              ? "mx-auto mt-10 w-full min-w-0 max-w-3xl border-t border-border/60 pt-8 sm:mt-12 sm:pt-10"
              : "mx-auto mt-8 w-full min-w-0 max-w-3xl sm:mt-10"
          }
        >
          {hasTags ? (
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tags &amp; topics
            </h2>
          ) : null}
          <TagsAndKeywords tags={article.tags} keywords={article.keywords} />
        </div>

        {(article.related_products?.length ?? 0) > 0 ? (
          <section className="mt-12 w-full min-w-0 border-t border-border/60 pt-10 sm:mt-14 sm:pt-12 md:mt-16 md:pt-14">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Products you want
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Frames and lenses featured in this article—swipe to explore.
            </p>
            <div className="mt-2 w-full min-w-0 overflow-hidden">
              <MultiCardSlider
                className="w-full min-w-0 px-0 sm:px-2"
                swiperClass="w-full min-w-0"
                slideClass="py-6 sm:py-8"
                template={BlogRelatedProductCard}
                data={article.related_products}
                navigation
              />
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
};

export default BlogDetailsPage;
