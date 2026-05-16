import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { createOAuthState } from "@/lib/wearables/oauth-state";
import { getWearableRedirectUri } from "@/lib/wearables/config";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.redirect(new URL("/settings?error=auth_required", req.url));
  }

  const clientId = process.env.GARMIN_CLIENT_ID;
  const authorizeUrl = process.env.GARMIN_AUTHORIZE_URL || "https://connect.garmin.com/oauthConfirm";
  if (!clientId) {
    return NextResponse.redirect(new URL("/settings?error=garmin_config", req.url));
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getWearableRedirectUri("garmin", req.url),
    scope: "activity sleep",
    state: createOAuthState("garmin", data.user.id),
  });

  return NextResponse.redirect(`${authorizeUrl}?${params.toString()}`);
}
