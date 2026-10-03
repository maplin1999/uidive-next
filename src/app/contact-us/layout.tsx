import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "See new dives, community highlights, and UiDive updates on social media.",
  openGraph: {
    title: "Contact UiDive",
    description: "See new dives, community highlights, and UiDive updates on social media.",
  },
  twitter: {
    title: "Contact UiDive",
    description: "See new dives, community highlights, and UiDive updates on social media.",
  },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
