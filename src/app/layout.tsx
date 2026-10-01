import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UiDive",
  description: "Scuba dive trip booking and community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // data-theme starts as "dark" to match the old site's default; the real
  // theme-toggle button (with its localStorage persistence) moves over
  // when we migrate the shared nav/header component.
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
