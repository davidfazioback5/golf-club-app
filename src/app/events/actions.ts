"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/session";

export async function createEvent(formData: FormData) {
  const member = await requireMember();

  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !date) return;

  await db.event.create({
    data: {
      name,
      date: new Date(date),
      location: location || null,
      description: description || null,
      createdById: member.id,
    },
  });

  revalidatePath("/events");
  revalidatePath("/");
}

export async function registerForEvent(formData: FormData) {
  const member = await requireMember();
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return;

  await db.eventRegistration.upsert({
    where: { eventId_memberId: { eventId, memberId: member.id } },
    update: {},
    create: { eventId, memberId: member.id },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/");
}

export async function unregisterFromEvent(formData: FormData) {
  const member = await requireMember();
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return;

  await db.eventRegistration.deleteMany({
    where: { eventId, memberId: member.id },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/");
}

export async function submitEventResult(formData: FormData) {
  const member = await requireMember();
  const eventId = String(formData.get("eventId") ?? "");
  const score = Number(formData.get("score"));
  if (!eventId || !Number.isFinite(score)) return;

  await db.eventResult.upsert({
    where: { eventId_memberId: { eventId, memberId: member.id } },
    update: { score },
    create: { eventId, memberId: member.id, score },
  });

  revalidatePath(`/events/${eventId}`);
}
