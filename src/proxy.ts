import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function expectedCookie(): Promise<string | null> {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`taberna:${key}`)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const expected = await expectedCookie();
  if (expected && req.cookies.get("taberna_admin")?.value === expected) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
