"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function setMemberAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const memberId = String(formData.get("memberId") ?? "");
  const isAdmin = formData.get("isAdmin") === "true";
  if (!memberId) return;

  if (memberId === admin.id && !isAdmin) return;

  await db.member.update({ where: { id: memberId }, data: { isAdmin } });
  revalidatePath("/admin");
}

export async function removeMember(formData: FormData) {
  const admin = await requireAdmin();
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId || memberId === admin.id) return;

  await db.member.delete({ where: { id: memberId } });
  revalidatePath("/admin");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function removeEvent(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return;

  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function removeTeeTime(formData: FormData) {
  await requireAdmin();
  const teeTimeId = String(formData.get("teeTimeId") ?? "");
  if (!teeTimeId) return;

  await db.teeTime.delete({ where: { id: teeTimeId } });
  revalidatePath("/admin");
  revalidatePath("/tee-times");
  revalidatePath("/");
}
