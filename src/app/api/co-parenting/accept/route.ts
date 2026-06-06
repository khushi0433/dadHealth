import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";
import { verifyInviteToken } from "@/lib/coParenting/inviteToken";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to accept this invite" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";

  const payload = verifyInviteToken(token);
  if (!payload) {
    return NextResponse.json({ error: "This invite link is invalid or has expired" }, { status: 400 });
  }

  // The account accepting must be the email the invite was sent to.
  if ((user.email ?? "").toLowerCase() !== payload.email) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address" },
      { status: 403 }
    );
  }

  // A dad can't be his own co-parent.
  if (user.id === payload.dadUserId) {
    return NextResponse.json({ error: "You can't accept your own invite" }, { status: 400 });
  }

  // Cross-user writes: the co-parent can't write the dad's rows under RLS,
  // so use the service-role client (same pattern as Stripe/milestone routes).
  const admin = createAdminSupabaseClient();

  const { error: scheduleError } = await admin
    .from("co_parenting_schedules")
    .update({ co_parent_user_id: user.id })
    .eq("user_id", payload.dadUserId);

  if (scheduleError) {
    return NextResponse.json({ error: "Unable to link the shared calendar" }, { status: 500 });
  }

  const { error: profileError } = await admin
    .from("user_profile")
    .update({ co_parent_id: user.id })
    .eq("user_id", payload.dadUserId);

  if (profileError) {
    return NextResponse.json({ error: "Unable to link the co-parent account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
