"use client";
import WhatsappIcon from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import useCurrentUrl from "@/hooks/use-current-url";
import Link from "next/link";
import { cn } from "@/lib/utils";

const BuyOnWhatsapp = ({ isMobile }: { isMobile?: boolean }) => {
  const url = useCurrentUrl();
  const message = encodeURIComponent(`
    Hi, I am interested in one of your product. Please contact me.
    The link to the product is: ${url}
    `);
  const href = `https://api.whatsapp.com/send/?phone=918188881661&text=${message}`;

  if (isMobile) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-11 w-11 shrink-0 !text-success hover:bg-success/10",
        )}
        asChild
      >
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy on WhatsApp"
        >
          <WhatsappIcon className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      variant="ghost"
      className="inline-flex items-center gap-2 !text-success hover:bg-success/10"
      asChild
    >
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <WhatsappIcon className="h-5 w-5" />
        <span className="font-medium">Buy on WhatsApp</span>
      </Link>
    </Button>
  );
};
export default BuyOnWhatsapp;
