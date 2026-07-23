"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const HOLE_COUNT = 18;

function numberOrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

function stringOrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str || null;
}

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const holes = [];
  for (let number = 1; number <= HOLE_COUNT; number++) {
    const par = numberOrNull(formData.get(`par-${number}`));
    if (par == null) return;

    holes.push({
      number,
      par,
      menIndex: stringOrNull(formData.get(`menIndex-${number}`)),
      menMetres: numberOrNull(formData.get(`menMetres-${number}`)),
      ladiesIndex: stringOrNull(formData.get(`ladiesIndex-${number}`)),
      ladiesMetres: numberOrNull(formData.get(`ladiesMetres-${number}`)),
    });
  }

  const course = await db.course.create({
    data: { name, holes: { create: holes } },
  });

  revalidatePath("/admin");
  revalidatePath("/scores");
  redirect(`/admin?courseCreated=${encodeURIComponent(course.name)}`);
}

export async function removeCourse(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return;

  const roundCount = await db.round.count({ where: { courseId } });
  if (roundCount > 0) return;

  await db.course.delete({ where: { id: courseId } });
  revalidatePath("/admin");
  revalidatePath("/scores");
}
