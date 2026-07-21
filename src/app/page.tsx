import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

export default async function Home() {
  const [currentMember, upcomingTeeTimes, upcomingEvents, recentRounds, memberCount] =
    await Promise.all([
      getCurrentMember(),
      db.teeTime.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 3,
        include: { players: true },
      }),
      db.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 3,
      }),
      db.round.findMany({
        orderBy: { datePlayed: "desc" },
        take: 5,
        include: { member: true },
      }),
      db.member.count(),
    ]);

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-black/10 bg-white p-8 dark:border-white/15 dark:bg-zinc-900">
        <h1 className="text-3xl font-bold">
          {currentMember ? `Welcome back, ${currentMember.name}` : "Welcome to Fairway Social Club"}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {memberCount} member{memberCount === 1 ? "" : "s"} · track scores,
          book tee times, and join club events.
        </p>
        {!currentMember && (
          <Link
            href="/signin"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Sign in / Join the club
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Next tee times</h2>
            <Link href="/tee-times" className="text-sm text-zinc-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingTeeTimes.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Nothing booked yet.</p>
            ) : (
              upcomingTeeTimes.map((tt) => (
                <div
                  key={tt.id}
                  className="rounded-lg border border-black/10 bg-white p-3 text-sm dark:border-white/15 dark:bg-zinc-900"
                >
                  <p className="font-medium">{tt.courseName}</p>
                  <p className="text-zinc-500">
                    {tt.date.toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · {tt.players.length}/{tt.maxPlayers}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming events</h2>
            <Link href="/events" className="text-sm text-zinc-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No events scheduled.</p>
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-black/10 bg-white p-3 text-sm hover:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/40"
                >
                  <p className="font-medium">{event.name}</p>
                  <p className="text-zinc-500">
                    {event.date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent scores</h2>
            <Link href="/scores" className="text-sm text-zinc-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentRounds.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No rounds logged yet.</p>
            ) : (
              recentRounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 text-sm dark:border-white/15 dark:bg-zinc-900"
                >
                  <span>{round.member.name}</span>
                  <span className="font-semibold">{round.score}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
