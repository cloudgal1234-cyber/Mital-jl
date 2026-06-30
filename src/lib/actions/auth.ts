"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/auth";

export async function loginAdmin(password: string): Promise<{ success: false; error: string } | never> {
  const expectedPassword = process.env.ADMIN_PASSWORD || "1234";
  if (!password || password !== expectedPassword) {
    return { success: false, error: "סיסמה שגויה" };
  }

  const token = await createSessionToken();
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
