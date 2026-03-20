import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Dad feed, circles, expert Q&A.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
