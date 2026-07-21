import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await db.member.findUnique({
    where: { id },
    include: {
      rounds: { orderBy: { datePlayed: "desc" }, take: 10 },
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
          <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 text-left dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Course</th>
                  <th className="px-4 py-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {member.rounds.map((round) => (
                  <tr
                    key={round.id}
                    className="border-t border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
                  >
                    <td className="px-4 py-2">
                      {round.datePlayed.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{round.courseName}</td>
                    <td className="px-4 py-2 font-semibold">{round.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
