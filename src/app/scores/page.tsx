import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { logRound } from "./actions";

export default async function ScoresPage() {
  const [grouped, recentRounds, currentMember] = await Promise.all([
    db.round.groupBy({
      by: ["memberId"],
      _min: { score: true },
      _avg: { score: true },
      _count: { _all: true },
    }),
    db.round.findMany({
      orderBy: { datePlayed: "desc" },
      take: 15,
      include: { member: true },
    }),
    getCurrentMember(),
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
          <h2 className="mb-3 text-lg font-semibold">Leaderboard</h2>
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
            <ul className="space-y-2 text-sm">
              {recentRounds.map((round) => (
                <li
                  key={round.id}
                  className="flex items-center justify-between rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/15 dark:bg-zinc-900"
                >
                  <span>
                    <strong>{round.member.name}</strong> — {round.courseName}
                  </span>
                  <span className="flex items-center gap-3 text-zinc-500">
                    {round.datePlayed.toLocaleDateString()}
                    <span className="font-semibold text-black dark:text-white">
                      {round.score}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Log a round</h2>
          {currentMember ? (
            <form
              action={logRound}
              className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Course
                </label>
                <input
                  name="courseName"
                  required
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  placeholder="Fairway Social Club"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Date played
                  </label>
                  <input
                    name="datePlayed"
                    type="date"
                    required
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Score
                  </label>
                  <input
                    name="score"
                    type="number"
                    required
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                    placeholder="82"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Notes (optional)
                </label>
                <input
                  name="notes"
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  placeholder="Windy day, played the back nine twice"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Save round
              </button>
            </form>
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
