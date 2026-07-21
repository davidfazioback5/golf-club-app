"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/session";

export async function createTeeTime(formData: FormData) {
  const member = await requireMember();

  const courseName = String(formData.get("courseName") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const maxPlayers = Number(formData.get("maxPlayers") ?? 4);

  if (!courseName || !date) return;

  const teeTime = await db.teeTime.create({
    data: {
      courseName,
      date: new Date(date),
      maxPlayers: Number.isFinite(maxPlayers) && maxPlayers > 0 ? maxPlayers : 4,
      createdById: member.id,
      players: {
        create: { memberId: member.id },
      },
    },
  });

  revalidatePath("/tee-times");
  revalidatePath("/");
  void teeTime;
}

export async function joinTeeTime(formData: FormData) {
  const member = await requireMember();
  const teeTimeId = String(formData.get("teeTimeId") ?? "");
  if (!teeTimeId) return;

  const teeTime = await db.teeTime.findUnique({
    where: { id: teeTimeId },
    include: { _count: { select: { players: true } } },
  });
  if (!teeTime || teeTime._count.players >= teeTime.maxPlayers) return;

  await db.teeTimePlayer.upsert({
    where: { teeTimeId_memberId: { teeTimeId, memberId: member.id } },
    update: {},
    create: { teeTimeId, memberId: member.id },
  });

  revalidatePath("/tee-times");
  revalidatePath("/");
}

export async function leaveTeeTime(formData: FormData) {
  const member = await requireMember();
  const teeTimeId = String(formData.get("teeTimeId") ?? "");
  if (!teeTimeId) return;

  await db.teeTimePlayer.deleteMany({
    where: { teeTimeId, memberId: member.id },
  });

  revalidatePath("/tee-times");
  revalidatePath("/");
}
