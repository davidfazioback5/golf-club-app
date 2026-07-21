import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import {
  registerForEvent,
  unregisterFromEvent,
  submitEventResult,
} from "../actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [event, currentMember] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: {
        registrations: { include: { member: true } },
        results: { include: { member: true }, orderBy: { score: "asc" } },
        createdBy: true,
      },
    }),
    getCurrentMember(),
  ]);

  if (!event) notFound();

  const isRegistered = currentMember
    ? event.registrations.some((r) => r.memberId === currentMember.id)
    : false;
  const myResult = currentMember
    ? event.results.find((r) => r.memberId === currentMember.id)
    : undefined;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {event.date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        {event.description && <p className="mt-4 text-sm">{event.description}</p>}
        <p className="mt-2 text-xs text-zinc-500">
          Organized by {event.createdBy.name}
        </p>

        {currentMember && (
          <div className="mt-4">
            {isRegistered ? (
              <form action={unregisterFromEvent}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Cancel registration
                </button>
              </form>
            ) : (
              <form action={registerForEvent}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  Register
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Registered ({event.registrations.length})
          </h2>
          {event.registrations.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No one has registered yet.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {event.registrations.map((r) => (
                <li
                  key={r.id}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  {r.member.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Results</h2>
          {event.results.length === 0 ? (
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              No results submitted yet.
            </p>
          ) : (
            <div className="mb-4 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 text-left dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Member</th>
                    <th className="px-4 py-2 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {event.results.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-t border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
                    >
                      <td className="px-4 py-2 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">
                        {r.member.name}
                      </td>
                      <td className="px-4 py-2 font-semibold">{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentMember && isRegistered && (
            <form
              action={submitEventResult}
              className="flex items-end gap-2 rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
            >
              <input type="hidden" name="eventId" value={event.id} />
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">
                  {myResult ? "Update your score" : "Submit your score"}
                </label>
                <input
                  name="score"
                  type="number"
                  required
                  defaultValue={myResult?.score}
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  placeholder="76"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
