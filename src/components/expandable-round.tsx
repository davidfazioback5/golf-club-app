"use client";

import { useState } from "react";

type HoleLine = { number: number; par: number; strokes: number };

export function ExpandableRound({
  summary,
  holes,
}: {
  summary: React.ReactNode;
  holes: HoleLine[];
}) {
  const [open, setOpen] = useState(false);
  const parTotal = holes.reduce((sum, h) => sum + h.par, 0);
  const strokesTotal = holes.reduce((sum, h) => sum + h.strokes, 0);

  return (
    <div className="rounded-md border border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm"
      >
        <span className="flex items-center gap-2">
          <span className="text-zinc-400">{open ? "▾" : "▸"}</span>
          {summary}
        </span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-black/10 px-3 py-2 dark:border-white/15">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-1 py-1 text-left font-medium text-zinc-500">
                  Hole
                </th>
                {holes.map((h) => (
                  <th
                    key={h.number}
                    className="px-1 py-1 text-center font-medium text-zinc-500"
                  >
                    {h.number}
                  </th>
                ))}
                <th className="px-1 py-1 text-center font-medium text-zinc-500">
                  Tot
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-black/10 dark:border-white/15">
                <td className="px-1 py-1 text-zinc-500">Par</td>
                {holes.map((h) => (
                  <td
                    key={h.number}
                    className="px-1 py-1 text-center text-zinc-500"
                  >
                    {h.par}
                  </td>
                ))}
                <td className="px-1 py-1 text-center text-zinc-500">
                  {parTotal}
                </td>
              </tr>
              <tr className="border-t border-black/10 dark:border-white/15">
                <td className="px-1 py-1 font-medium">Strokes</td>
                {holes.map((h) => (
                  <td key={h.number} className="px-1 py-1 text-center font-semibold">
                    {h.strokes}
                  </td>
                ))}
                <td className="px-1 py-1 text-center font-semibold">
                  {strokesTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
