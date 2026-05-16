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

  const clientId = process.env.FITBIT_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/settings?error=fitbit_config", req.url));
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getWearableRedirectUri("fitbit", req.url),
    scope: "activity heartrate sleep profile",
    state: createOAuthState("fitbit", data.user.id),
  });

  return NextResponse.redirect(`https://www.fitbit.com/oauth2/authorize?${params.toString()}`);
}
