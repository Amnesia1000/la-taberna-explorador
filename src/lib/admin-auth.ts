"use server";

import { cookies } from "next/headers";

const COOKIE = "taberna_admin";
const encoder = new TextEncoder();

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function digest(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

async function expectedCookie(): Promise<string | null> {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) return null;
  return digest(`taberna:${key}`);
}

export async function isAdminConfigured(): Promise<boolean> {
  return (await expectedCookie()) !== null;
}

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const expected = await expectedCookie();
  if (!expected) {
    return { success: false, error: "Login no configurado (falta ADMIN_PASSWORD)." };
  }
  const attempt = await digest(`taberna:${password}`);
  if (attempt !== expected) {
    return { success: false, error: "Clave incorrecta." };
  }
  (await cookies()).set(COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
