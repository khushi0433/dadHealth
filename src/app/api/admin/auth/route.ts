import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (session === adminKey) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export async function POST(req: Request) {
  const { key } = await req.json();
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    return NextResponse.json({ error: "Admin access is not configured" }, { status: 503 });
  }

  if (!key || key !== adminKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", adminKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ ok: true });
}
