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
        },
      },
    }
  );

  await supabase.auth.getUser();
  
  try {
    // Determine subdomain/slug from request hostname and set a cookie so
    // client-side code can pick up branding before any auth state.
    const hostname = request.nextUrl.hostname || "";
    let slug = "dadhealth"; // default

    if (hostname) {
      const parts = hostname.split(".");
      // Naive approach: take first label as subdomain when present
      if (parts.length > 2) {
        slug = parts[0];
      } else if (parts.length === 2) {
        // e.g. localhost or example.com — treat first part as slug for dev
        if (parts[0] !== "www") slug = parts[0];
      }
    }

    // Verify the slug exists in the clients table by either slug or subdomain.
    const { data: clientRow } = await supabase
      .from("clients")
      .select("slug, subdomain")
      .or(`slug.eq.${slug},subdomain.eq.${slug}`)
      .maybeSingle();
    if (!clientRow) {
      slug = "dadhealth";
    }

    // Set a non-httpOnly cookie so client JS can read it.
    try {
      supabaseResponse.cookies.set("client_slug", slug, { path: "/", sameSite: "lax" });
    } catch (e) {
      // ignore cookie set errors in edge environment
    }
  } catch (err) {
    // swallow errors — middleware should not block requests if branding fails
    console.error("updateSession: branding lookup failed", err);
  }

  return supabaseResponse;
}
