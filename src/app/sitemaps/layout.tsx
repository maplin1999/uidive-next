import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Map",
  description: "Every page on UiDive, in one place.",
};

export default function SitemapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
