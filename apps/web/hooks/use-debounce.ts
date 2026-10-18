import { useRef, useEffect } from "react";

/**
 * A hook that debounces a function call.
 * @param callback The function to execute after delay
 * @param delay Delay in ms (default 300ms)
 * @returns A debounced function that accepts any value
 */
export function useDebounce<T>(
  callback: (value: T) => void,
  delay: number = 300,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const debouncedFn = (value: T) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(value);
    }, delay);
  };

  return debouncedFn;
}
