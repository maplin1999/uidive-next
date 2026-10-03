import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about booking, hosting, and using UiDive.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
