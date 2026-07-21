import { db } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { signInAsMember, joinClub, signOut } from "./actions";

export default async function SignInPage() {
  const [members, currentMember] = await Promise.all([
    db.member.findMany({ orderBy: { name: "asc" } }),
    getCurrentMember(),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This is a small club app — pick your name to identify yourself,
          no password needed.
        </p>
      </div>

      {currentMember && (
        <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
          <span className="text-sm">
            Signed in as <strong>{currentMember.name}</strong>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      )}

      {members.length > 0 && (
        <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold">I&apos;m already a member</h2>
          <form action={signInAsMember} className="flex gap-2">
            <select
              name="memberId"
              required
              className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            >
              <option value="">Select your name…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Sign in
            </button>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
        <h2 className="mb-3 font-semibold">New to the club?</h2>
        <form action={joinClub} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              name="name"
              required
              className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
              placeholder="Jamie Rivera"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
              placeholder="jamie@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Handicap (optional)
            </label>
            <input
              name="handicap"
              type="number"
              step="0.1"
              className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
              placeholder="14.2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Join the club
          </button>
        </form>
      </div>
    </div>
  );
}
