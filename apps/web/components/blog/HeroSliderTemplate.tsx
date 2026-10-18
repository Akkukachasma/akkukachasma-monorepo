import Image from "next/image";
import { IArticle } from "../articles/ListItem";
import Link from "next/link";
import { Button } from "../ui/button";

interface HeroSliderTemplateProps {
  data: IArticle;
}

const HeroSliderTemplate: React.FC<HeroSliderTemplateProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-6 md:pt-4 lg:pt-14">
      <div className="flex flex-col gap-4 md:gap-12 lg:gap-16 xl:gap-20 md:flex-row py-5 flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl font-semibold text-foreground/80 flex-grow">
          {data.title}
        </h1>
        <div className="w-80 flex-shrink-0 flex flex-col">
          <div className="flex-grow">
            <p className="text-sm text-foreground/60 line-clamp-4">
              {data.description}
            </p>
          </div>

          <Button
            asChild
            className="mt-3 flex-shrink-0 w-fit"
          >
            <Link href={`/blog/${data.slug}`}>Read full blog</Link>
          </Button>
        </div>
      </div>

      <div className="flex-grow aspect-video bg-red-300 relative">
        <Image
          className="w-full h-full object-cover"
          src={data.thumbnail?.url || ""}
          width={1200}
          height={500}
          alt="Picture of the author"
        />
      </div>
    </div>
  );
};

export default HeroSliderTemplate;
