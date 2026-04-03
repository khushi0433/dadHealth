import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  const url = new URL(request.url);
  const origin =
  process.env.NODE_ENV === "development"
    ? `${url.protocol}//${url.host}`
    : process.env.NEXTAUTH_URL!;

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${next}`}`);
}