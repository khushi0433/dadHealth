import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useClientBySlug } from "@/hooks/useClient";

interface LogoProps {
  large?: boolean;
  className?: string;
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

const Logo = ({ large, className }: LogoProps) => {
  const [slug] = useState<string | undefined>(() => getClientSlugFromBrowser());
  const { data: client } = useClientBySlug(slug);

  // If the client provides a logo_url, show it. Otherwise fall back to text mark.
  if (client && (client as any).logo_url) {
    const logoUrl = (client as any).logo_url as string;
    return (
      <div className={cn("inline-flex items-center relative", className)} style={{ padding: large ? "7px 16px" : "4px 10px" }}>
        <img src={logoUrl} alt={client.name} className={cn(large ? "h-10" : "h-6", "object-contain")} />
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center relative", className)}
      style={{
        padding: large ? "7px 16px" : "4px 10px",
      }}
    >
      {/* Top border */}
      <span className="absolute top-0 left-0 right-0 border-t-2 border-foreground" />
      {/* Left border */}
      <span className="absolute top-0 bottom-0 left-0 border-l-2 border-foreground" />
      {/* Right border */}
      <span className="absolute top-0 bottom-0 right-0 border-r-2 border-foreground" />
      {/* Bottom border — two segments with a gap in the middle */}
      <span className="absolute bottom-0 left-0 w-[30%] border-b-2 border-foreground" />
      <span className="absolute bottom-0 right-0 w-[30%] border-b-2 border-foreground" />

      <span className={cn("font-heading font-extrabold text-primary leading-none tracking-wide", large ? "text-[28px]" : "text-[17px]")}>
        DAD
      </span>
      <span className={cn("font-heading font-extrabold text-foreground leading-none tracking-wide", large ? "text-[28px] ml-[7px]" : "text-[17px] ml-1")}>
        HEALTH
      </span>
    </div>
  );
};

export default Logo;
