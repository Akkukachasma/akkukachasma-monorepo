"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the value.
 * Updates after `delay` ms of no changes to `value`.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
