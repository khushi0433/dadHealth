import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getWearableRedirectUri } from "@/lib/wearables/config";
import { verifyOAuthState } from "@/lib/wearables/oauth-state";
import { encryptWearableToken } from "@/lib/wearables/tokens";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = verifyOAuthState(req.nextUrl.searchParams.get("state"), "garmin");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?error=garmin", req.url));
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || data.user.id !== state.userId) {
    return NextResponse.redirect(new URL("/settings?error=auth_required", req.url));
  }

  const clientId = process.env.GARMIN_CLIENT_ID;
  const clientSecret = process.env.GARMIN_CLIENT_SECRET;
  const tokenUrl = process.env.GARMIN_TOKEN_URL || "https://api.garmin.com/oauth2/token";
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/settings?error=garmin_config", req.url));
  }

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: getWearableRedirectUri("garmin", req.url),
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/settings?error=garmin_token", req.url));
  }

  const tokenData = await tokenRes.json();
  const admin = createAdminSupabaseClient();

  const { error } = await admin.from("user_integrations").upsert(
    {
      user_id: data.user.id,
      provider: "garmin",
      access_token: encryptWearableToken(tokenData.access_token),
      refresh_token: encryptWearableToken(tokenData.refresh_token),
      device_name: "Garmin",
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );

  if (error) {
    return NextResponse.redirect(new URL("/settings?error=garmin_save", req.url));
  }

  return NextResponse.redirect(new URL("/settings?connected=garmin", req.url));
}
