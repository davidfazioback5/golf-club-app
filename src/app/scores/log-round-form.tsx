"use client";

import { useState } from "react";
import { logRound } from "./actions";

type Hole = { number: number; par: number };
type CourseOption = { id: string; name: string; holes: Hole[] };

export function LogRoundForm({ courses }: { courses: CourseOption[] }) {
  const [courseId, setCourseId] = useState("");
  const [strokes, setStrokes] = useState<Record<number, string>>({});

  const course = courses.find((c) => c.id === courseId);
  const holes = course?.holes ?? [];

  const total = holes.reduce((sum, h) => sum + (Number(strokes[h.number]) || 0), 0);
  const parTotal = holes.reduce((sum, h) => sum + h.par, 0);
  const holesEntered = holes.filter((h) => strokes[h.number]).length;

  function handleCourseChange(id: string) {
    setCourseId(id);
    setStrokes({});
  }

  return (
    <form
      action={logRound}
      className="space-y-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Course</label>
        <select
          name="courseId"
          required
          value={courseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        >
          <option value="">Search for a course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {courses.length === 0 && (
          <p className="mt-1 text-xs text-zinc-500">
            No courses set up yet — an admin needs to add one first.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Date played</label>
        <input
          name="datePlayed"
          type="date"
          required
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
      </div>

      {course && (
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Scorecard</span>
            <span className="text-zinc-500">
              Par {parTotal} · Total{" "}
              <span className="font-semibold text-black dark:text-white">
                {holesEntered === holes.length ? total : "–"}
              </span>
            </span>
          </div>
          <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/15">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">Hole</th>
                  {holes.map((h) => (
                    <th key={h.number} className="px-1 py-1.5 text-center font-medium">
                      {h.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/10 dark:border-white/15">
                  <td className="px-2 py-1.5 text-zinc-500">Par</td>
                  {holes.map((h) => (
                    <td key={h.number} className="px-1 py-1.5 text-center text-zinc-500">
                      {h.par}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-black/10 dark:border-white/15">
                  <td className="px-2 py-1.5 font-medium">Strokes</td>
                  {holes.map((h) => (
                    <td key={h.number} className="px-1 py-1.5">
                      <input
                        name={`strokes-${h.number}`}
                        type="number"
                        required
                        min={1}
                        value={strokes[h.number] ?? ""}
                        onChange={(e) =>
                          setStrokes((s) => ({ ...s, [h.number]: e.target.value }))
                        }
                        className="w-10 rounded border border-black/10 bg-transparent px-1 py-1 text-center text-sm dark:border-white/15"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
        <input
          name="notes"
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          placeholder="Windy day, played the back nine twice"
        />
      </div>

      <button
        type="submit"
        disabled={!course}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        Save round
      </button>
    </form>
  );
}
