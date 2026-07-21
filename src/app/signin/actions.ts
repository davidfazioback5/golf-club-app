"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setCurrentMember, clearCurrentMember } from "@/lib/session";

export async function signInAsMember(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return;
  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member) return;
  await setCurrentMember(member.id);
  redirect("/");
}

export async function joinClub(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const handicapRaw = String(formData.get("handicap") ?? "").trim();

  if (!name || !email) return;

  const member = await db.member.upsert({
    where: { email },
    update: { name },
    create: {
      name,
      email,
      handicap: handicapRaw ? Number(handicapRaw) : null,
    },
  });

  await setCurrentMember(member.id);
  redirect("/");
}

export async function signOut() {
  await clearCurrentMember();
  redirect("/signin");
}
