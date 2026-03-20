import type { Metadata } from "next";
import Providers from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: {
    default: "Dad Health — Be the Stronger Dad",
    template: "%s | Dad Health",
  },
  description:
    "Built for dads, by dads. Fitness, mental health, bonding and community — kill the old version of you. Be the stronger dad, mentally, physically and as a parent.",
  keywords: ["dad health", "fitness", "mental health", "parenting", "fathers", "dads"],
  authors: [{ name: "Dad Health", url: "https://dadhealth.co.uk" }],
  openGraph: {
    title: "Dad Health — Be the Stronger Dad",
    description: "Built for dads, by dads. Fitness, mental health, bonding and community.",
    type: "website",
    url: "https://dadhealth.co.uk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

