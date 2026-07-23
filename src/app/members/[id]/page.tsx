import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExpandableRound } from "@/components/expandable-round";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await db.member.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { datePlayed: "desc" },
        take: 10,
        include: { course: { include: { holes: true } }, holeScores: true },
      },
    },
  });

  if (!member) notFound();

  const bestScore = member.rounds.length
    ? Math.min(...member.rounds.map((r) => r.score))
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold">{member.name}</h1>
        <div className="mt-2 flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          {member.handicap != null && <span>Handicap: {member.handicap}</span>}
          {bestScore != null && <span>Best score: {bestScore}</span>}
          <span>
            Member since{" "}
            {member.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })}
          </span>
        </div>
        {member.bio && <p className="mt-4 text-sm">{member.bio}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent rounds</h2>
        {member.rounds.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No rounds logged yet.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {member.rounds.map((round) => {
              const holes = round.course.holes
                .slice()
                .sort((a, b) => a.number - b.number)
                .map((h) => ({
                  number: h.number,
                  par: h.par,
                  strokes:
                    round.holeScores.find((hs) => hs.holeNumber === h.number)
                      ?.strokes ?? 0,
                }));

              return (
                <ExpandableRound
                  key={round.id}
                  holes={holes}
                  summary={
                    <span className="flex flex-1 items-center justify-between">
                      <span>{round.course.name}</span>
                      <span className="flex items-center gap-3 text-zinc-500">
                        {round.datePlayed.toLocaleDateString()}
                        <span className="font-semibold text-black dark:text-white">
                          {round.score}
                        </span>
                      </span>
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
