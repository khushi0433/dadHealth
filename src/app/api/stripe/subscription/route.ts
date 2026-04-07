import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { isProSubscriptionStatus } from "@/lib/stripe/subscription";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isPro: false, isSubscribed: false, status: null });
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = (profile as { subscription_status?: string } | null)?.subscription_status ?? null;
  const active = isProSubscriptionStatus(status);

  return NextResponse.json({
    isPro: active,
    isSubscribed: active,
    status,
  });
}
