import type { Metadata } from "next";

// page.tsx in this route is a client component (it needs hooks/state for
// the live feed), and the App Router's `metadata` export only works from a
// server component -- so the per-page title/description live here, in a
// sibling layout.tsx, which Next renders around the client page for free.
export const metadata: Metadata = {
  title: "Community",
  description: "Browse real dive logs and photos from the UiDive diver community.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
