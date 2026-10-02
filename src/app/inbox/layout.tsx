import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Buddy requests, direct messages, and trip group chats.",
};

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
