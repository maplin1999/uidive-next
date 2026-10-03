import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of UiDive.",
  openGraph: {
    title: "Terms of Service",
    description: "The terms that govern your use of UiDive.",
  },
  twitter: {
    title: "Terms of Service",
    description: "The terms that govern your use of UiDive.",
  },
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
