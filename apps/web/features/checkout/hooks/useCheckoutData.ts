"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useLoggedInUser } from "@/features/auth";
import { IGetCheckoutResponse } from "@/components/checkout/OrderItems";
import { ICartItem } from "@/components/cart/CartItem";
import { ICoupon } from "@/components/coupon-manager/ListItem";

export interface ICheckoutPreviewPricing {
  base_subtotal: number;
  subtotal: number;
  discount_on_mrp: number;
  lens_detail_price: number;
  shipping_price: number;
  total: number;
  total_gst?: number;
  total_other_taxes?: number;
  gst_breakdown?: {
    total_gst: number;
    cgst: number;
    sgst: number;
    igst: number;
    rounded_by?: number;
  };
  applied_coupon?: {
    coupon: ICoupon | null;
    discount: number;
  };
}

export interface ICheckoutPreviewResponse {
  cart_items: ICartItem[];
  coupon: ICoupon | null;
  pricing: ICheckoutPreviewPricing | null;
  summary: {
    subtotal: number;
    estimated_total: number;
  };
}

export type CheckoutData = IGetCheckoutResponse | ICheckoutPreviewResponse;

export function isOrderCheckout(
  data: CheckoutData | undefined
): data is IGetCheckoutResponse {
  return data !== undefined && "order_items" in data && "payment" in data;
}

export function useCheckoutData() {
  const { data: user, isLoading: authLoading } = useLoggedInUser();
  const isGuest = !authLoading && !user;
  const api = getApiClient();

  const runAttachAndCartCheckout = async () => {
    // Safety net for password login, Google OAuth, and any auth path that
    // redirects to checkout without calling attach first.
    try {
      await api.post(ENDPOINTS.cart.attach);
    } catch {
      // No guest cart or already attached — continue with cart-checkout
    }
    await api.post(ENDPOINTS.checkout.from_cart);
    const res = await api.get(ENDPOINTS.checkout.fetch_checkout_details);
    return res.data?.data as IGetCheckoutResponse;
  };

  const orderQuery = useQuery({
    queryKey: [ENDPOINTS.checkout.fetch_checkout_details],
    queryFn: async () => {
      // Always attach guest cart (if any) then re-sync initiated order from cart.
      // Cart is source of truth — avoids showing a stale order from another device
      // after login merge, and rebuilds coupon pricing when still valid.
      return runAttachAndCartCheckout();
    },
    enabled: !isGuest,
  });

  const cartPreviewQuery = useQuery({
    queryKey: [ENDPOINTS.cart.checkout_preview],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.cart.checkout_preview);
      return res.data?.data as ICheckoutPreviewResponse;
    },
    enabled: isGuest,
  });

  if (isGuest) {
    return {
      isGuest: true,
      data: cartPreviewQuery.data,
      isLoading: authLoading || cartPreviewQuery.isLoading,
      refetch: cartPreviewQuery.refetch,
    };
  }

  return {
    isGuest: false,
    data: orderQuery.data,
    isLoading: authLoading || orderQuery.isLoading,
    refetch: orderQuery.refetch,
  };
}
