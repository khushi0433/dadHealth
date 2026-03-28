import { type NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/middleware";

const PROTECTED_PATHS = ["/fitness", "/mind", "/bond", "/community", "/progress"];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
