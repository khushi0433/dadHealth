"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useClient } from "@/hooks/useClient";
import { useEffect } from "react";
import type { BrandConfig } from "@/types/database";

const DEFAULT_BRAND: BrandConfig = {
  primary: "78 89% 65%",
  primaryForeground: "0 0% 4%",
  accent: "78 89% 65%",
  lime: "78 89% 65%",
  ring: "78 89% 65%",
  sidebarPrimary: "78 89% 65%",
  sidebarRing: "78 89% 65%",
};

function injectBrandStyles(config: BrandConfig) {
  const primary = config.primary ?? DEFAULT_BRAND.primary;
  const primaryFg = config.primaryForeground ?? DEFAULT_BRAND.primaryForeground;
  const accent = config.accent ?? DEFAULT_BRAND.accent;
  const lime = config.lime ?? DEFAULT_BRAND.lime;
  const ring = config.ring ?? DEFAULT_BRAND.ring;
  const sidebarPrimary = config.sidebarPrimary ?? primary;
  const sidebarRing = config.sidebarRing ?? ring;

  const css = `
    :root {
      --primary: ${primary};
      --primary-foreground: ${primaryFg};
      --accent: ${accent};
      --accent-foreground: ${primaryFg};
      --ring: ${ring};
      --lime: ${lime};
      --sidebar-primary: ${sidebarPrimary};
      --sidebar-ring: ${sidebarRing};
    }
  `;

  let el = document.getElementById("client-brand-styles");
  if (!el) {
    el = document.createElement("style");
    el.id = "client-brand-styles";
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export default function ClientBrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { data: client } = useClient(profile?.client_id ?? undefined);

  useEffect(() => {
    const config = client?.brand_config ?? DEFAULT_BRAND;
    injectBrandStyles(config);
  }, [client?.brand_config]);

  return <>{children}</>;
}
