import type { ReactNode } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/navigation/Footer";
import { CustomerMobileSidebarShell } from "@/features/customer/sidebar";

/**
 * Shared storefront chrome for marketing routes: sticky nav + footer.
 * Product PDP lives outside this group (`/[product_slug]/[model_number]`).
 */
export default function PublicPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CustomerMobileSidebarShell>
      <Navigation />
      {children}
      <Footer />
    </CustomerMobileSidebarShell>
  );
}
