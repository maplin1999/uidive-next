import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dive Safe",
  description: "Dive safety guidelines for divers using UiDive.",
  openGraph: {
    title: "Dive Safe",
    description: "Dive safety guidelines for divers using UiDive.",
  },
  twitter: {
    title: "Dive Safe",
    description: "Dive safety guidelines for divers using UiDive.",
  },
};

export default function DiveSafeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
