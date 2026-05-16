import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";

const providers = new Set(["garmin", "fitbit"]);

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  if (!providers.has(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("user_integrations")
    .delete()
    .eq("user_id", data.user.id)
    .eq("provider", provider);

  if (error) {
    return NextResponse.json({ error: "Unable to disconnect wearable" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
