import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "We bring real trips, real hosts, and a real community of divers together in one place.",
  openGraph: {
    title: "About UiDive",
    description: "We bring real trips, real hosts, and a real community of divers together in one place.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
