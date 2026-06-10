import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { verifyInviteToken } from "@/lib/coParenting/inviteToken";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // token-only preview: no auth required
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = verifyInviteToken(token);
  if (!payload) {
    return NextResponse.json({ error: "This invite link is invalid or has expired" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_profile")
    .select("display_name")
    .eq("user_id", payload.dadUserId)
    .maybeSingle();

  if (error) {
    // Fallback: still allow invite acceptance; display name isn't critical
    return NextResponse.json({ inviterDisplayName: null, invitedByUserId: payload.dadUserId });
  }

  return NextResponse.json({
    invitedByUserId: payload.dadUserId,
    inviterDisplayName: data?.display_name ?? null,
  });
}

