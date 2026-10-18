import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import GlobalModals from "@/components/GlobalModals";
import { cookies } from "next/headers";
import { getDetails } from "@/features/auth/service";
import { AUTH_DETAILS_QUERY_KEY } from "@/features/auth/query-keys";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { TOKENS } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme";
import FloatingWhatsapp from "@/components/FloatingWhatsapp";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akku Ka Chasma",
  description: `Akku ka Chasma gives you Eyeglasses | Contact lenses | Sunglasses service Since 2013 India
  Click or call we fix all online/offline in India`,
  icons: {
    icon: "/favicon/favicon-32x32.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  verification: {
    google: "OLsVkwtvMthLsqczm3ylZ-_XGiJ4THxITNPTzEkjI6I",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKENS.AUTH_TOKEN)?.value;
  const detailsResponse = await getDetails(token);
  const userData = detailsResponse?.data ?? null;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  });
  // Always set auth query so client has resolved state (user or null) and doesn't show skeleton when logged out
  queryClient.setQueryData(AUTH_DETAILS_QUERY_KEY, userData);
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("h-full")}>
        <ThemeProvider>
          <Providers dehydratedState={dehydratedState}>
            <GlobalModals />
            {children}
            <FloatingWhatsapp />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
