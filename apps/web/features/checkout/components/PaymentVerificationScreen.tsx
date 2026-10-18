"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentVerificationScreenProps {
  open: boolean;
}

const ringVariants = {
  animate: {
    rotate: 360,
    transition: { duration: 2.8, repeat: Infinity, ease: "linear" as const },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.06, 1],
    opacity: [0.5, 0.85, 0.5],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.55,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut" as const,
    },
  }),
};

export function PaymentVerificationScreen({ open }: PaymentVerificationScreenProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="payment-verification"
          role="alertdialog"
          aria-modal="true"
          aria-busy="true"
          aria-live="polite"
          aria-labelledby="payment-verification-title"
          aria-describedby="payment-verification-desc"
          className={cn(
            "fixed inset-0 z-[10001] flex items-center justify-center",
            "bg-gradient-to-b from-background via-background to-primary/5",
            "dark:from-background dark:via-background dark:to-primary/10",
            "px-4 py-8 sm:px-6",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <motion.div
              className="absolute -left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
              variants={pulseVariants}
              animate="animate"
            />
            <motion.div
              className="absolute -right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
              variants={pulseVariants}
              animate="animate"
              transition={{ delay: 0.4 }}
            />
          </div>

          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-md sm:p-10">
              <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
                  variants={ringVariants}
                  animate="animate"
                />
                <motion.div
                  className="absolute inset-2 rounded-full bg-primary/10"
                  variants={pulseVariants}
                  animate="animate"
                />
                <motion.div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ShieldCheck className="h-8 w-8" strokeWidth={1.75} />
                </motion.div>
              </div>

              <div className="space-y-3 text-center">
                <h1
                  id="payment-verification-title"
                  className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                >
                  Verifying your payment
                </h1>
                <p
                  id="payment-verification-desc"
                  className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  Please wait while we securely confirm your transaction. Do not
                  close or refresh this page.
                </p>
              </div>

              <div
                className="mt-8 flex items-center justify-center gap-2"
                aria-hidden
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-primary"
                    custom={i}
                    variants={dotVariants}
                    animate="animate"
                  />
                ))}
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground/80">
                This usually takes a few seconds
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default PaymentVerificationScreen;
