import { getCategories } from "@/services/category.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by category | Akku Ka Chasma",
  description:
    "Browse eyeglasses and frames by category. Find the style that fits you.",
};

const CategoriesPage = async () => {
  let categories: Awaited<ReturnType<typeof getCategories>> | null = null;
  try {
    categories = await getCategories();
  } catch {
    return (
      <div className="app-container py-12 text-center text-muted-foreground">
        Categories could not be loaded. Please try again later.
      </div>
    );
  }

  const list = categories?.data ?? [];
  if (!list.length) {
    return (
      <div className="app-container py-12 text-center text-muted-foreground">
        No categories available yet.
      </div>
    );
  }

  return (
    <div className="app-container py-8 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Shop by category
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
        Choose a category to explore frames and eyeglasses curated for you.
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
        {list.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center rounded-xl p-2 transition-colors hover:bg-muted/50 md:p-3"
            >
              <Avatar className="size-20 shadow-md transition-transform animate-smooth group-hover:scale-95 md:size-28">
                <AvatarImage src={category.image?.url} alt={category.title} />
                <AvatarFallback className="rounded-full bg-muted text-lg">
                  {category.title?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="mt-2 line-clamp-2 text-center text-xs font-medium leading-snug md:text-sm">
                {category.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
