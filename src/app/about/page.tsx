import type { Metadata } from "next";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import AboutScreen from "@/components/about/AboutScreen";

export const metadata: Metadata = {
  title: "About — Dad Health",
  description:
    "Dad Health is built for dads, by dads — mental health, fitness, nutrition and connection in one honest place.",
  openGraph: {
    title: "About — Dad Health",
    description:
      "Built for dads, by dads. Mental health, fitness, nutrition and connection in one honest place.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <SitePageShell>
      <AboutScreen />
      <SiteFooter />
    </SitePageShell>
  );
}
