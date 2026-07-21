import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { createEvent } from "./actions";

export default async function EventsPage() {
  const [events, currentMember] = await Promise.all([
    db.event.findMany({
      orderBy: { date: "asc" },
      include: { _count: { select: { registrations: true } } },
    }),
    getCurrentMember(),
  ]);

  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now);
  const past = events.filter((e) => e.date < now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Events & Tournaments</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Club tournaments and social events.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No upcoming events yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="block rounded-lg border border-black/10 bg-white p-4 hover:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{event.name}</span>
                        <span className="text-xs text-zinc-500">
                          {event._count.registrations} registered
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {event.date.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Past</h2>
              <ul className="space-y-2">
                {past.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="block rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-zinc-600 hover:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-white/40"
                    >
                      {event.name} —{" "}
                      {event.date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Create an event</h2>
          {currentMember ? (
            <form
              action={createEvent}
              className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  placeholder="Fall Member-Guest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Location
                  </label>
                  <input
                    name="location"
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                    placeholder="Main course"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  placeholder="Shotgun start, teams of two, best ball."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Create event
              </button>
            </form>
          ) : (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/15 dark:bg-zinc-900">
              <a href="/signin" className="font-medium underline">
                Sign in
              </a>{" "}
              to create an event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
