"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/session";

export async function logRound(formData: FormData) {
  const member = await requireMember();

  const courseName = String(formData.get("courseName") ?? "").trim();
  const datePlayed = String(formData.get("datePlayed") ?? "");
  const score = Number(formData.get("score"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!courseName || !datePlayed || !Number.isFinite(score)) return;

  await db.round.create({
    data: {
      memberId: member.id,
      courseName,
      datePlayed: new Date(datePlayed),
      score,
      notes: notes || null,
    },
  });

  revalidatePath("/scores");
  revalidatePath("/");
  revalidatePath(`/members/${member.id}`);
}
