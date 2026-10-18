import { getCategories } from "@/services/category.service";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const Categories = async () => {
  let categories = null;
  try {
    categories = await getCategories();
  } catch {
    return null;
  }

  if (!categories?.data?.length) return null;

  return (
    <div className="app-container flex snap-x snap-mandatory gap-4 overflow-x-auto py-8 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-center md:gap-8 md:overflow-visible md:py-10 [&::-webkit-scrollbar]:hidden">
      {categories.data?.map((category) => (
        <Link
          href={`/categories/${category.slug}`}
          key={category.id}
          className="group flex w-[100px] shrink-0 snap-start flex-col items-center sm:w-[120px] md:max-w-[160px]"
        >
          <Avatar className="size-[88px] rounded-full shadow-md transition-transform animate-smooth group-hover:scale-95 group-hover:shadow-xl sm:size-[100px] md:size-[120px]">
            <AvatarImage src={category.image?.url} alt={category.title} />
            <AvatarFallback className="rounded-full bg-muted">
              {category.title?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm animate-smooth text-foreground group-hover:text-primary line-clamp-1 font-semibold tracking-wide mt-2 text-center">
            {category.title}
          </p>
        </Link>
      ))}
    </div>
  );
};
export default Categories;
