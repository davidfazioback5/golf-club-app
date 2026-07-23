import { requireAdmin } from "@/lib/session";
import { createCourse } from "../actions";

const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add a course</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter the scorecard — par is required for each hole, index and
          metres are optional.
        </p>
      </div>

      <form action={createCourse} className="space-y-6">
        <div className="max-w-sm">
          <label className="mb-1 block text-sm font-medium">Course name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            placeholder="Dunheved Golf Club"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-zinc-100 text-left dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 font-medium">Hole</th>
                <th className="px-3 py-2 font-medium">Par</th>
                <th className="px-3 py-2 font-medium">Men index</th>
                <th className="px-3 py-2 font-medium">Men metres</th>
                <th className="px-3 py-2 font-medium">Ladies index</th>
                <th className="px-3 py-2 font-medium">Ladies metres</th>
              </tr>
            </thead>
            <tbody>
              {HOLES.map((hole) => (
                <tr
                  key={hole}
                  className="border-t border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
                >
                  <td className="px-3 py-1.5 font-medium">{hole}</td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`par-${hole}`}
                      type="number"
                      required
                      min={3}
                      max={6}
                      className="w-16 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`menIndex-${hole}`}
                      type="text"
                      placeholder="12/26"
                      className="w-16 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`menMetres-${hole}`}
                      type="number"
                      className="w-20 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`ladiesIndex-${hole}`}
                      type="text"
                      placeholder="7/25/45"
                      className="w-16 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      name={`ladiesMetres-${hole}`}
                      type="number"
                      className="w-20 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Save course
        </button>
      </form>
    </div>
  );
}
