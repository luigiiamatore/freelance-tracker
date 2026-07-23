import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import DarkModeToggle from "@/components/DarkModeToggle";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/income", label: "Income" },
  { href: "/expenses", label: "Expenses" },
  { href: "/calculator", label: "Tax Calculator" },
];

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Freelance Tracker
        </Link>

        {user && (
          <nav className="hidden gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user && (
            <a
              href="/api/export"
              className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Export
            </a>
          )}
          {user && (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          )}
        </div>
      </div>

      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-zinc-200 px-4 py-2 sm:hidden dark:border-zinc-800">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
