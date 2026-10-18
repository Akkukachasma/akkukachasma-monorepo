"use client";

import PageWrapper from "@/components/wrappers/PageWrapper";
import CustomerOrdersList from "@/features/customer/orders/components/CustomerOrdersList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

const OrdersPage = () => {
  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 touch-manipulation border-emerald-500/30 sm:min-h-9"
            asChild
          >
            <Link href="/track-order">
              <Truck className="mr-2 h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
            </Link>
          </Button>
        </div>
        <CustomerOrdersList />
      </PageWrapper>
    </div>
  );
};
export default OrdersPage;
