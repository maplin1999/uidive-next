import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
  description: "Terms of service and privacy policy for UiDive.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
