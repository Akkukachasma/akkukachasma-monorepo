"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { IUser } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/api";
import { getCookie } from "cookies-next";
import { TOKENS } from "@/lib/constants";
import { useLoggedInUser } from "@/features/auth";
import {
  adminNotificationsQueryKey,
  customerNotificationsQueryKey,
} from "@/features/notifications/query-keys";
import { publishManifestJob } from "@/features/admin/orders/manifest-job-events";

/**
 * Subscribes to real-time notification events for the logged-in user (same-origin / cross-origin API + Bearer cookie).
 * Also forwards Delhivery Ready To Ship (manifest) job progress to admin orders UI.
 */
export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { data: user } = useLoggedInUser();
  const socketRef = useRef<Socket | null>(null);
  const userId = (user as IUser | undefined)?.id;

  useEffect(() => {
    if (!userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    const token = getCookie(TOKENS.AUTH_TOKEN);
    if (typeof token !== "string" || !token) return;

    const base = getBaseUrl();
    const socket = io(`${base}/notifications`, {
      transports: ["websocket", "polling"],
      auth: { token },
      withCredentials: true,
    });
    socketRef.current = socket;

    const invalidate = () => {
      // Refetch active lists (panel unread + page/dashboard) when a new notification arrives
      void queryClient.invalidateQueries({
        queryKey: [...adminNotificationsQueryKey],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: [...customerNotificationsQueryKey],
        refetchType: "active",
      });
    };

    const onManifestStarted = (...args: unknown[]) => {
      const payload = args[0] as { job_id: string; total: number };
      publishManifestJob({
        type: "started",
        job_id: payload.job_id,
        total: payload.total,
      });
    };

    const onManifestProgress = (...args: unknown[]) => {
      const payload = args[0] as {
        job_id: string;
        order_id: string;
        status: "attempting" | "success" | "failed" | "skipped";
        attempt: number;
        max_attempts: number;
        message?: string;
        waybill_number?: string;
      };
      publishManifestJob({
        type: "progress",
        ...payload,
      });
    };

    const onManifestCompleted = (...args: unknown[]) => {
      const payload = args[0] as {
        job_id: string;
        counts: { success: number; failed: number; skipped: number };
      };
      publishManifestJob({
        type: "completed",
        job_id: payload.job_id,
        counts: payload.counts,
      });
    };

    socket.on("notification:new", invalidate);
    socket.on("orders:manifest:started", onManifestStarted);
    socket.on("orders:manifest:progress", onManifestProgress);
    socket.on("orders:manifest:completed", onManifestCompleted);

    return () => {
      socket.off("notification:new", invalidate);
      socket.off("orders:manifest:started", onManifestStarted);
      socket.off("orders:manifest:progress", onManifestProgress);
      socket.off("orders:manifest:completed", onManifestCompleted);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, queryClient]);

  return <>{children}</>;
}
