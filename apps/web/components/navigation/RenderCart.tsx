"use client";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
interface RenderCartProps {
  className?: string;
  isMobile?: boolean;
}
const RenderCart: React.FC<RenderCartProps> = ({
  className = "",
  isMobile,
}) => {


  return (
    <Button variant={isMobile ? "default" : "ghost"} size={isMobile ? "icon" : "default"} className={cn("inline-flex items-center gap-1", isMobile && "shadow-none bg-white text-foreground rounded-full",  className)} asChild>
      <Link
        href="/cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {!isMobile && <span>Cart</span>}
      </Link>
    </Button>
  );
};
export default RenderCart;
