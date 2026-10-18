"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { shouldShowFloatingWhatsapp } from "@/lib/floating-whatsapp";
import { Button } from "./ui/button";
import Link from "next/link";
import WhatsappIcon from "./icons/WhatsappIcon";

const FloatingWhatsapp = () => {
  const pathname = usePathname();

  if (!shouldShowFloatingWhatsapp(pathname)) {
    return null;
  }

  const message = encodeURIComponent(
    "Hi, I am interested in one of your products. Please contact me.",
  );
  const href = `https://api.whatsapp.com/send/?phone=918188881661&text=${message}`;

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "fixed bottom-3 sm:bottom-12 right-3 sm:right-24 z-50 h-fit w-fit shrink-0 rounded-full !bg-white bg-white !text-success hover:bg-success/10",
      )}
      asChild
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy on WhatsApp"
      >
        <WhatsappIcon className="h-12 sm:h-14 w-12 sm:w-14" />
      </Link>
    </Button>
  );
};

export default FloatingWhatsapp;
