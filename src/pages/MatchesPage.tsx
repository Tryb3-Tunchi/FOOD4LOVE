import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { useMatch } from "../hooks/useMatch";

export function MatchesPage() {
  const { user } = useAuth();
  const { isLoading, matches } = useMatch(user?.id ?? null);

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4">
        <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          Matches
        </div>
        <div className="text-xs text-slate-600 dark:text-zinc-400">
          Chat is available after a match
        </div>
      </header>

      {isLoading ? (
        <div className="text-sm text-slate-600 dark:text-zinc-300">
          Loading…
        </div>
      ) : null}

      {!isLoading && matches.length === 0 ? (
        <div className="text-sm text-slate-600 dark:text-zinc-300">
          No matches yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {matches.map((m) => {
          const otherId = m.buyer_id === user?.id ? m.cook_id : m.buyer_id;
          return (
            <Link key={m.id} to={`/chat/${m.id}`} className="block">
              <Card className="p-4 transition hover:bg-black/5 dark:hover:bg-white/6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Match
                    </div>
                    <div className="mt-1 text-xs break-all text-slate-600 dark:text-zinc-400">
                      Other: {otherId}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    Open
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
