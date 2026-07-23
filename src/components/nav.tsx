import Link from "next/link";
import { getCurrentMember } from "@/lib/session";

const links = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Members" },
  { href: "/scores", label: "Scores" },
  { href: "/tee-times", label: "Tee Times" },
  { href: "/events", label: "Events" },
];

export async function Nav() {
  const member = await getCurrentMember();

  return (
    <header className="border-b border-black/10 dark:border-white/15 bg-white dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ⛳ Fairway Social Club
        </Link>
        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {member ? (
            <>
              {member.isAdmin && (
                <Link
                  href="/admin"
                  className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/signin"
                className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800"
              >
                {member.name}
              </Link>
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-full bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
