import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mental Health",
  description: "Mental health check-ins, breathing exercises, journal, therapist directory.",
};

export default function MindLayout({ children }: { children: React.ReactNode }) {
  return children;
}
