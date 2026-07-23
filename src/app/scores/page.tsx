import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { ExpandableRound } from "@/components/expandable-round";
import { LogRoundForm } from "./log-round-form";

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course: selectedCourseId } = await searchParams;

  const [courses, currentMember] = await Promise.all([
    db.course.findMany({
      orderBy: { name: "asc" },
      include: { holes: { orderBy: { number: "asc" } } },
    }),
    getCurrentMember(),
  ]);

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : undefined;
  const whereClause = selectedCourse ? { courseId: selectedCourse.id } : {};

  const [grouped, recentRounds] = await Promise.all([
    db.round.groupBy({
      by: ["memberId"],
      where: whereClause,
      _min: { score: true },
      _avg: { score: true },
      _count: { _all: true },
    }),
    db.round.findMany({
      where: whereClause,
      orderBy: { datePlayed: "desc" },
      take: 15,
      include: {
        member: true,
        course: { include: { holes: true } },
        holeScores: true,
      },
    }),
  ]);

  const memberIds = grouped.map((g) => g.memberId);
  const members = await db.member.findMany({
    where: { id: { in: memberIds } },
  });
  const memberById = new Map(members.map((m) => [m.id, m]));

  const leaderboard = grouped
    .map((g) => ({
      member: memberById.get(g.memberId),
      best: g._min.score ?? 0,
      avg: g._avg.score ?? 0,
      rounds: g._count._all,
    }))
    .filter((row) => row.member)
    .sort((a, b) => a.best - b.best);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Scores</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Best round score per member, lowest first.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <Link
              href="/scores"
              className={`rounded-full px-3 py-1 font-medium ${
                !selectedCourse
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              Overall
            </Link>
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/scores?course=${c.id}`}
                className={`rounded-full px-3 py-1 font-medium ${
                  selectedCourse?.id === c.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <h2 className="mb-3 text-lg font-semibold">
            {selectedCourse ? `${selectedCourse.name} leaderboard` : "Overall leaderboard"}
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No rounds logged yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 text-left dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Member</th>
                    <th className="px-4 py-2 font-medium">Best</th>
                    <th className="px-4 py-2 font-medium">Avg</th>
                    <th className="px-4 py-2 font-medium">Rounds</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => (
                    <tr
                      key={row.member!.id}
                      className="border-t border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
                    >
                      <td className="px-4 py-2 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">
                        {row.member!.name}
                      </td>
                      <td className="px-4 py-2 font-semibold">{row.best}</td>
                      <td className="px-4 py-2">{row.avg.toFixed(1)}</td>
                      <td className="px-4 py-2">{row.rounds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="mb-3 mt-8 text-lg font-semibold">Recent rounds</h2>
          {recentRounds.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nothing logged yet.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentRounds.map((round) => {
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
                        <span>
                          <strong>{round.member.name}</strong> —{" "}
                          {round.course.name}
                        </span>
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

        <div>
          <h2 className="mb-3 text-lg font-semibold">Log a round</h2>
          {currentMember ? (
            <LogRoundForm
              courses={courses.map((c) => ({
                id: c.id,
                name: c.name,
                holes: c.holes.map((h) => ({ number: h.number, par: h.par })),
              }))}
            />
          ) : (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/15 dark:bg-zinc-900">
              <a href="/signin" className="font-medium underline">
                Sign in
              </a>{" "}
              to log a round.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
