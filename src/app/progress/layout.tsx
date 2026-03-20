import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress",
  description: "Dad Health Score, report card, badges, sleep tracker.",
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
