import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Order | Akku Ka Chasma",
  description:
    "Track your Akku Ka Chasma order. Enter your order ID to see delivery status and real-time tracking updates.",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
