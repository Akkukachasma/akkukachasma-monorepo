import { useState, useEffect, useCallback, useRef } from "react";
import { parse } from "../lib/utils";

type SetValue<T> = T | ((prevValue: T) => T);

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

const useSessionStorage = <T = any>(
  key: string | undefined,
  initialValue?: T,
): {
  value: T | undefined;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
} => {
  const storageKey = key ?? "";
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  // Always start from initialValue so SSR and the first client paint match.
  // Session values are applied in useEffect below (after hydration).
  const [state, setState] = useState<T | undefined>(initialValue);

  const stateRef = useRef<T | undefined>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setValue = useCallback(
    (valueOrFn: SetValue<T>) => {
      const prev = stateRef.current;
      const newValue =
        typeof valueOrFn === "function"
          ? (valueOrFn as (p: T) => T)(prev as T)
          : valueOrFn;

      if (stableStringify(newValue) === stableStringify(prev)) {
        return;
      }

      stateRef.current = newValue;

      if (typeof window !== "undefined" && storageKey) {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify(newValue));
        } catch {
          /* quota / private mode */
        }
        window.dispatchEvent(
          new CustomEvent(`session-storage-${storageKey}`, {
            detail: { key: storageKey, value: newValue },
          }),
        );
      }
      setState(newValue);
    },
    [storageKey],
  );

  const removeValue = useCallback(() => {
    stateRef.current = undefined;
    if (typeof window !== "undefined" && storageKey) {
      window.sessionStorage.removeItem(storageKey);
      window.dispatchEvent(
        new CustomEvent(`session-storage-${storageKey}`, {
          detail: { key: storageKey, value: undefined },
        }),
      );
    }
    setState(undefined);
  }, [storageKey]);

  // Hydrate from sessionStorage when key changes, or seed if empty (no initialValue dep — avoids infinite loops from inline objects).
  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.storageArea === window.sessionStorage &&
        e.key === storageKey
      ) {
        const next = e.newValue ? parse(e.newValue) : undefined;
        setState((prev) =>
          stableStringify(prev) === stableStringify(next) ? prev : next,
        );
        stateRef.current = next;
      }
    };

    const handleCustomChange = (e: Event) => {
      const ce = e as CustomEvent<{ key: string; value: T }>;
      if (ce.detail?.key !== storageKey) return;
      const next = ce.detail.value;
      setState((prev) =>
        stableStringify(prev) === stableStringify(next) ? prev : next,
      );
      stateRef.current = next;
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      `session-storage-${storageKey}`,
      handleCustomChange as EventListener,
    );

    const raw = window.sessionStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = parse(raw) as T;
        setState((prev) =>
          stableStringify(prev) === stableStringify(parsed) ? prev : parsed,
        );
        stateRef.current = parsed;
      } catch {
        /* ignore */
      }
    } else {
      const seed = initialValueRef.current;
      if (seed !== undefined) {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify(seed));
        } catch {
          /* ignore */
        }
        setState((prev) =>
          stableStringify(prev) === stableStringify(seed) ? prev : seed,
        );
        stateRef.current = seed;
      } else {
        setState((prev) => (prev === undefined ? prev : undefined));
        stateRef.current = undefined;
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        `session-storage-${storageKey}`,
        handleCustomChange as EventListener,
      );
    };
  }, [storageKey]);

  return { value: state, setValue, removeValue };
};

export default useSessionStorage;
