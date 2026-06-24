import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required by @supabase/ssr to keep the session cookie fresh.
  // THIS IS THE ONLY THING THIS FUNCTION SHOULD DO.
  // Do NOT add DB queries here — this runs on every HTTP request including
  // navigations, API calls, and prefetches. A DB query here was the root
  // cause of production Supabase rate-limit errors.
  await supabase.auth.getUser();

  // Derive client slug from hostname only — no DB lookup.
  // ClientBrandProvider validates it client-side via React Query (cached).
  // Only write the cookie if it is not already set to avoid redundant work.
  const existingSlug = request.cookies.get("client_slug")?.value;
  if (!existingSlug) {
    const hostname = request.nextUrl.hostname || "";
    let slug = "dadhealth";
    if (hostname) {
      const parts = hostname.split(".");
      if (parts.length > 2) {
        slug = parts[0];
      } else if (parts.length === 2 && parts[0] !== "www") {
        slug = parts[0];
      }
    }
    try {
      supabaseResponse.cookies.set("client_slug", slug, {
        path: "/",
        sameSite: "lax",
        maxAge: 3600,
      });
    } catch {
      // ignore cookie errors in edge runtime
    }
  }

  return supabaseResponse;
}