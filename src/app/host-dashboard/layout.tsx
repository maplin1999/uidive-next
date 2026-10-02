import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Dashboard",
  description: "Manage your dive trips, bookings, and roster.",
};

export default function HostDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
