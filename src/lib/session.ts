import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "member_id";

export async function getCurrentMember() {
  const store = await cookies();
  const memberId = store.get(SESSION_COOKIE)?.value;
  if (!memberId) return null;
  return db.member.findUnique({ where: { id: memberId } });
}

export async function setCurrentMember(memberId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, memberId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearCurrentMember() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/signin");
  return member;
}
