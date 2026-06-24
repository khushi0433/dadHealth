import { type NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files.
     * Keeping this tight reduces middleware invocations and therefore
     * reduces Supabase auth.getUser() calls — directly cutting rate-limit risk.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|js|css|woff|woff2|ttf|otf)$).*)",
  ],
};