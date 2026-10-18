"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SetValue<T> = T | ((prevValue: T | null | undefined) => T);

/** Supports JSON-encoded values (from setValue) and plain strings (e.g. color_name from router). */
function parseQueryParamValue(item: string): unknown {
  try {
    return JSON.parse(item);
  } catch {
    return item;
  }
}

function useQueryState<T = any>(
  name: string,
  initialValue?: T,
): {
  value: T | undefined;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
} {
  const isClient = typeof window !== "undefined";
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<T | undefined>(initialValue);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const newParams = new URLSearchParams(params);
      if (value !== null) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      return newParams.toString();
    },
    [params],
  );

  const setValue = useCallback(
    (valueOrFn: SetValue<T>) => {
      const newValue =
        valueOrFn instanceof Function ? valueOrFn(state) : valueOrFn;

      if (isClient) {
        const valueToSave = JSON.stringify(newValue);
        const newQueryString = createQueryString(name, valueToSave);
        router.replace(`?${newQueryString}`);

        // Dispatch custom event for cross-tab communication
        window.dispatchEvent(
          new CustomEvent(`query-state-${name}`, {
            detail: { name, value: newValue },
          }),
        );
      }
      setState(newValue);
    },
    [name, state, createQueryString, router, isClient],
  );

  const removeValue = useCallback(() => {
    if (isClient) {
      const newQueryString = createQueryString(name, null);
      router.push("?" + newQueryString);

      window.dispatchEvent(
        new CustomEvent(`query-state-${name}`, {
          detail: { name, value: undefined },
        }),
      );
    }
    setState(undefined);
  }, [name, createQueryString, router, isClient]);

  useEffect(() => {
    const handleCustomChange = (e: CustomEvent<{ name: string; value: T }>) => {
      if (isClient && e.detail.name === name) {
        setState(e.detail.value);
      }
    };

    if (isClient) {
      window.addEventListener(
        `query-state-${name}`,
        handleCustomChange as EventListener,
      );

      // Initialize from URL params
      const item = params.get(name);
      
      if (item) {
        setState(parseQueryParamValue(item) as T);
      } else {
        setState(initialValue);
      }
    }

    return () => {
      if (isClient) {
        window.removeEventListener(
          `query-state-${name}`,
          handleCustomChange as EventListener,
        );
      }
    };
  }, [name, params, initialValue, isClient]);

  return { value: state, setValue, removeValue };
}

export default useQueryState;
