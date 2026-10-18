import {
  Activity,
  Bell,
  DollarSign,
  Package,
  Pencil,
  Truck,
} from "lucide-react";
import type { Notification } from "@/features/admin/dashboard/queries/useNotifications";

export function styleForNotificationType(type: string) {
  const t = type.toLowerCase();

  if (t === "resource_mutation" || t.includes("resource_mutation")) {
    return {
      Icon: Pencil,
      iconWrap: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
      accent: "bg-violet-500",
      label: "Change",
      labelClass: "bg-violet-500/10 text-violet-800 dark:text-violet-300",
    };
  }

  if (t === "admin_activity" || t.includes("admin_activity")) {
    return {
      Icon: Activity,
      iconWrap: "bg-orange-500/12 text-orange-700 dark:text-orange-400",
      accent: "bg-orange-500",
      label: "Activity",
      labelClass: "bg-orange-500/10 text-orange-800 dark:text-orange-300",
    };
  }

  if (t.includes("order") || t.includes("placed")) {
    return {
      Icon: Package,
      iconWrap: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
      accent: "bg-emerald-500",
      label: "Order",
      labelClass:
        "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    };
  }
  if (t.includes("payment")) {
    return {
      Icon: DollarSign,
      iconWrap: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
      accent: "bg-amber-500",
      label: "Payment",
      labelClass: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
    };
  }
  if (t.includes("deliver") || t.includes("ship")) {
    return {
      Icon: Truck,
      iconWrap: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
      accent: "bg-sky-500",
      label: "Shipping",
      labelClass: "bg-sky-500/10 text-sky-800 dark:text-sky-300",
    };
  }
  return {
    Icon: Bell,
    iconWrap: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/40",
    label: type.replace(/_/g, " ").toLowerCase(),
    labelClass: "bg-muted text-muted-foreground",
  };
}

export function notificationBody(n: Notification) {
  return n.message ?? n.body ?? "";
}
