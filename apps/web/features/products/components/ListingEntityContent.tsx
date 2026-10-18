import TagsAndKeywords from "@/components/blog/TagsAndKeywords";
import { cn } from "@/lib/utils";

export interface ListingEntityContentProps {
  title: string;
  description?: string | null;
  keywords?: string[] | null;
  className?: string;
}

/** Title + rich description shown below listing pagination (shape/category pages). */
export default function ListingEntityContent({
  title,
  description,
  keywords,
  className,
}: ListingEntityContentProps) {
  const html = description?.trim();
  const chips = (keywords ?? []).filter((k) => k?.trim());
  if (!title?.trim() && !html && !chips.length) return null;

  return (
    <section
      className={cn(
        "app-container border-t border-border/60 py-8 md:py-10",
        className,
      )}
    >
      {title?.trim() ? (
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h1>
      ) : null}
      {html ? (
        <div
          className="article-container mt-3 max-w-3xl text-sm text-muted-foreground md:text-base"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
      {chips.length ? (
        <div className="mt-4">
          <TagsAndKeywords tags={[]} keywords={chips} />
        </div>
      ) : null}
    </section>
  );
}
