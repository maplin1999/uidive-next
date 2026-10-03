import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Why UiDive exists and what we're building for divers.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
