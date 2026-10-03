import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How UiDive collects, uses, and protects your information.",
  openGraph: {
    title: "Privacy Policy",
    description: "How UiDive collects, uses, and protects your information.",
  },
  twitter: {
    title: "Privacy Policy",
    description: "How UiDive collects, uses, and protects your information.",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
