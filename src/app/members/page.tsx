import Link from "next/link";
import { db } from "@/lib/db";

export default async function MembersPage() {
  const members = await db.member.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { rounds: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <Link
          href="/signin"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Join the club
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No members yet — be the first to join.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="rounded-lg border border-black/10 bg-white p-4 hover:border-black/30 dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{member.name}</span>
                {member.handicap != null && (
                  <span className="text-xs text-zinc-500">
                    HCP {member.handicap}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {member._count.rounds} round
                {member._count.rounds === 1 ? "" : "s"} logged
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
