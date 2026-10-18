import React from "react";

interface InfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
}

const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  fetchNextPage,
}: InfiniteScrollOptions) => {
  // Create a ref to store the IntersectionObserver instance
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // Callback for intersection observer
  const lastElementRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      // Disconnect the previous observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create new observer
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      // Observe the node
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return lastElementRef;
};

export default useInfiniteScroll;
