import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { createTeeTime, joinTeeTime, leaveTeeTime } from "./actions";

export default async function TeeTimesPage() {
  const [teeTimes, currentMember] = await Promise.all([
    db.teeTime.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { date: "asc" },
      include: { players: { include: { member: true } } },
    }),
    getCurrentMember(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tee Times</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Upcoming tee times — join a group or set up your own.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          {teeTimes.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No upcoming tee times yet.
            </p>
          ) : (
            teeTimes.map((teeTime) => {
              const isIn = currentMember
                ? teeTime.players.some((p) => p.memberId === currentMember.id)
                : false;
              const isFull = teeTime.players.length >= teeTime.maxPlayers;

              return (
                <div
                  key={teeTime.id}
                  className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{teeTime.courseName}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {teeTime.date.toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {teeTime.players.length}/{teeTime.maxPlayers} players
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {teeTime.players.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800"
                      >
                        {p.member.name}
                      </li>
                    ))}
                  </ul>

                  {currentMember && (
                    <div className="mt-3">
                      {isIn ? (
                        <form action={leaveTeeTime}>
                          <input
                            type="hidden"
                            name="teeTimeId"
                            value={teeTime.id}
                          />
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Leave
                          </button>
                        </form>
                      ) : (
                        <form action={joinTeeTime}>
                          <input
                            type="hidden"
                            name="teeTimeId"
                            value={teeTime.id}
                          />
                          <button
                            type="submit"
                            disabled={isFull}
                            className="text-sm font-medium text-black underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline dark:text-white"
                          >
                            {isFull ? "Full" : "Join"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Set up a tee time</h2>
          {currentMember ? (
            <form
              action={createTeeTime}
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
                    Date & time
                  </label>
                  <input
                    name="date"
                    type="datetime-local"
                    required
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Max players
                  </label>
                  <input
                    name="maxPlayers"
                    type="number"
                    defaultValue={4}
                    min={1}
                    max={8}
                    className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Create tee time
              </button>
            </form>
          ) : (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/15 dark:bg-zinc-900">
              <a href="/signin" className="font-medium underline">
                Sign in
              </a>{" "}
              to set up a tee time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
