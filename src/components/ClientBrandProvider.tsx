"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useClient, useClientBySlug } from "@/hooks/useClient";
import { useEffect, useState } from "react";
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

function getClientSlugFromBrowser(): string | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") return undefined;
  const cookieMatch = document.cookie.match(/(?:^|; )client_slug=([^;]+)/);
  if (cookieMatch?.[1]) return decodeURIComponent(cookieMatch[1]);

  const hostname = window.location.hostname || "";
  const parts = hostname.split(".");
  if (parts.length > 2) return parts[0];
  if (parts.length === 2 && parts[0] !== "www") return parts[0];
  return undefined;
}

export default function ClientBrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { data: clientById } = useClient(profile?.client_id ?? undefined);
  const [clientSlug] = useState<string | undefined>(() => getClientSlugFromBrowser());

  const { data: clientBySlug } = useClientBySlug(clientSlug);
  const client = clientBySlug ?? clientById;

  useEffect(() => {
    console.log("ClientBrandProvider:", {
      clientSlug,
      cookie: typeof document !== "undefined" ? document.cookie : undefined,
      clientById,
      clientBySlug,
      selectedClient: client,
    });

    const config = client?.brand_config ?? DEFAULT_BRAND;
    injectBrandStyles(config);
  }, [clientSlug, clientById, clientBySlug, client?.brand_config]);

  return <>{children}</>;
}
