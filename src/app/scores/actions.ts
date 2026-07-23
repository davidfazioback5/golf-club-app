"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/session";

export async function logRound(formData: FormData) {
  const member = await requireMember();

  const courseId = String(formData.get("courseId") ?? "");
  const datePlayed = String(formData.get("datePlayed") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!courseId || !datePlayed) return;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { holes: true },
  });
  if (!course) return;

  const holeScores: { holeNumber: number; strokes: number }[] = [];
  for (const hole of course.holes) {
    const strokes = Number(formData.get(`strokes-${hole.number}`));
    if (!Number.isFinite(strokes) || strokes <= 0) return;
    holeScores.push({ holeNumber: hole.number, strokes });
  }

  const total = holeScores.reduce((sum, h) => sum + h.strokes, 0);

  await db.round.create({
    data: {
      memberId: member.id,
      courseId,
      datePlayed: new Date(datePlayed),
      score: total,
      notes: notes || null,
      holeScores: { create: holeScores },
    },
  });

  revalidatePath("/scores");
  revalidatePath("/");
  revalidatePath(`/members/${member.id}`);
}
