import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
interface LogoProps {
  className?: string;
  imageClassName?: string;
}
const Logo: React.FC<LogoProps> = ({ className = "", imageClassName = "" }) => {
  return (
    <Link
      href="/"
      className={cn(
        "relative inline-block h-14 w-[300px] shrink-0 sm:h-16 md:h-[4.5rem] md:w-[265px] lg:h-[5.5rem] lg:w-[400px]",
        className,
      )}
    >
      <Image
        src="/Logo.png"
        alt="Akku Ka Chasma"
        fill
        className={cn("object-contain object-left dark:invert", imageClassName)}
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 265px, 310px"
        priority
      />
    </Link>
  );
};

export default Logo;
