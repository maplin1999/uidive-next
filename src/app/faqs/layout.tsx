import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about booking, hosting, and using UiDive.",
  openGraph: {
    title: "FAQs UiDive",
    description: "Answers to common questions about booking, hosting, and using UiDive.",
  },
  twitter: {
    title: "FAQs UiDive",
    description: "Answers to common questions about booking, hosting, and using UiDive.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
