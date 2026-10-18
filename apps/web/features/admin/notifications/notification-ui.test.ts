import { describe, expect, it } from "vitest";
import { Package, DollarSign, Truck, Activity, Pencil } from "lucide-react";
import {
  notificationBody,
  styleForNotificationType,
} from "./notification-ui";
import type { Notification } from "@/features/admin/dashboard/queries/useNotifications";

describe("styleForNotificationType", () => {
  it("maps ORDER_PLACED / order types to Package and Order label", () => {
    for (const type of ["ORDER_PLACED", "order", "ORDER_CONFIRMED"]) {
      const style = styleForNotificationType(type);
      expect(style.Icon).toBe(Package);
      expect(style.label).toBe("Order");
    }
  });

  it("maps payment types to Payment", () => {
    for (const type of ["PAYMENT_SUCCESS", "payment_failed", "PAYMENT_PENDING"]) {
      expect(styleForNotificationType(type).label).toBe("Payment");
      expect(styleForNotificationType(type).Icon).toBe(DollarSign);
    }
  });

  it("maps ship / deliver types to Shipping", () => {
    for (const type of ["SHIPPED", "delivered", "out_for_delivery"]) {
      expect(styleForNotificationType(type).label).toBe("Shipping");
      expect(styleForNotificationType(type).Icon).toBe(Truck);
    }
  });

  it("maps ADMIN_ACTIVITY / admin_activity to Activity", () => {
    for (const type of ["ADMIN_ACTIVITY", "admin_activity"]) {
      const style = styleForNotificationType(type);
      expect(style.Icon).toBe(Activity);
      expect(style.label).toBe("Activity");
    }
  });

  it("maps RESOURCE_MUTATION to Change", () => {
    for (const type of ["RESOURCE_MUTATION", "resource_mutation"]) {
      const style = styleForNotificationType(type);
      expect(style.Icon).toBe(Pencil);
      expect(style.label).toBe("Change");
    }
  });
});

describe("notificationBody", () => {
  const base = {
    id: "1",
    type: "ORDER_PLACED",
    title: "New order",
    timestamp: "2026-01-01T00:00:00.000Z",
    isRead: false,
  } satisfies Partial<Notification>;

  it("prefers message over body", () => {
    expect(
      notificationBody({
        ...base,
        message: "from message",
        body: "from body",
      } as Notification),
    ).toBe("from message");
  });

  it("falls back to body when message is missing", () => {
    expect(
      notificationBody({
        ...base,
        message: null,
        body: "from body",
      } as Notification),
    ).toBe("from body");
  });

  it("returns empty string when both are missing", () => {
    expect(
      notificationBody({
        ...base,
        message: undefined,
        body: undefined,
      } as Notification),
    ).toBe("");
  });
});
