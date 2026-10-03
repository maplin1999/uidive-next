import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the UiDive team.",
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
