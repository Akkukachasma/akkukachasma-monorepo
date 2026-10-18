import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { HeartOff } from "lucide-react";
import Link from "next/link";

const EmptyWishlist = () => {
  return (
    <EmptyState
      icon={HeartOff}
      title="Your wishlist is empty"
      description="Add items to your wishlist to keep track of products you love."
      className="min-h-[50vh]"
    >
      <Button asChild className="rounded-3xl">
        <Link href="/categories">Continue shopping</Link>
      </Button>
    </EmptyState>
  );
};

export default EmptyWishlist;
