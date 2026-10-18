"use client";
import { FC } from "react";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { IWrapper } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "react-redux";
import store from "@/store";
import { NotificationSocketProvider } from "@/features/notifications/NotificationSocketProvider";
import { LargeUploadProvider } from "@/features/large-upload";
import { RouteLoaderProvider } from "@/features/route-loader";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if you
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ProvidersProps extends IWrapper {
  /** Server-prefetched React Query state (e.g. auth details) for initial render. */
  dehydratedState?: DehydratedState;
}

const Providers: FC<ProvidersProps> = ({ children, dehydratedState }) => {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Provider store={store}>
          <LargeUploadProvider>
            <NotificationSocketProvider>
              <RouteLoaderProvider>{children}</RouteLoaderProvider>
            </NotificationSocketProvider>
          </LargeUploadProvider>
          <Toaster />
        </Provider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default Providers;
