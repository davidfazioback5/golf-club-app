import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { setMemberAdmin, removeMember, removeEvent, removeTeeTime } from "./actions";
import { removeCourse } from "./courses/actions";

export default async function AdminPage() {
  const currentAdmin = await requireAdmin();

  const [members, events, teeTimes, courses] = await Promise.all([
    db.member.findMany({ orderBy: { name: "asc" } }),
    db.event.findMany({ orderBy: { date: "desc" } }),
    db.teeTime.findMany({ orderBy: { date: "desc" }, include: { players: true } }),
    db.course.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { rounds: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage members, events, and tee times.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Members</h2>
        <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Admin</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
                >
                  <td className="px-4 py-2 font-medium">{member.name}</td>
                  <td className="px-4 py-2 text-zinc-500">{member.email}</td>
                  <td className="px-4 py-2">
                    <form action={setMemberAdmin}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <input
                        type="hidden"
                        name="isAdmin"
                        value={(!member.isAdmin).toString()}
                      />
                      <button
                        type="submit"
                        disabled={member.id === currentAdmin.id && member.isAdmin}
                        className="text-sm font-medium underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline"
                      >
                        {member.isAdmin ? "Revoke" : "Make admin"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    {member.id !== currentAdmin.id && (
                      <form action={removeMember}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <button
                          type="submit"
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Courses</h2>
          <Link
            href="/admin/courses/new"
            className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Add course
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No courses yet.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 text-sm dark:border-white/15 dark:bg-zinc-900"
              >
                <span>
                  {course.name}{" "}
                  <span className="text-zinc-500">
                    ({course._count.rounds} round
                    {course._count.rounds === 1 ? "" : "s"} logged)
                  </span>
                </span>
                {course._count.rounds === 0 && (
                  <form action={removeCourse}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No events yet.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 text-sm dark:border-white/15 dark:bg-zinc-900"
              >
                <span>
                  {event.name} — {event.date.toLocaleDateString()}
                </span>
                <form action={removeEvent}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tee times</h2>
        {teeTimes.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No tee times yet.</p>
        ) : (
          <ul className="space-y-2">
            {teeTimes.map((teeTime) => (
              <li
                key={teeTime.id}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-3 text-sm dark:border-white/15 dark:bg-zinc-900"
              >
                <span>
                  {teeTime.courseName} —{" "}
                  {teeTime.date.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {teeTime.players.length}/{teeTime.maxPlayers}
                </span>
                <form action={removeTeeTime}>
                  <input type="hidden" name="teeTimeId" value={teeTime.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
