import type { Metadata } from "next";

// Not indexed (see robots.ts) -- this title only ever shows in a signed-in
// diver's own browser tab/history, but that's reason enough on its own.
export const metadata: Metadata = {
  title: "My Profile",
  description: "Your dives, bookings, and Dive Log.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
