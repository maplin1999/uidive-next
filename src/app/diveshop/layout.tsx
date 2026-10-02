import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dive Shop",
  description: "Redeem Corals for vouchers, offers, and Treasure Chest cosmetics.",
};

export default function DiveshopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
