import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { useStories } from "../hooks/useStories";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../types/db";

type Row = Profile;

export function AdminPage() {
  const { user, profile } = useAuth();
  const { stories, deleteStory, refresh: refreshStories } = useStories(user?.id ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [seedRole, setSeedRole] = useState<"cook" | "buyer" | "both">("both");
  const [seedCount, setSeedCount] = useState(12);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    setItems((data as Row[]) ?? []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const hay = [
        p.id,
        p.name,
        p.nickname ?? "",
        p.phone ?? "",
        p.role,
        p.is_bot ? "bot" : "",
        p.is_admin ? "admin" : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const update = async (id: string, patch: Partial<Row>) => {
    setError(null);
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.map((p) => (p.id === id ? (data as Row) : p)));
  };

  const setRole = async (id: string, role: UserRole) => update(id, { role });

  const seedBots = async () => {
    setError(null);
    setIsSeeding(true);
    try {
      const cooks = seedRole === "cook" ? seedCount : seedRole === "both" ? seedCount : 0;
      const buyers = seedRole === "buyer" ? seedCount : seedRole === "both" ? seedCount : 0;
      const { error } = await supabase.functions.invoke("admin-seed", {
        body: { cooks, buyers },
      });
      if (error) throw error;
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsSeeding(false);
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
        <Card className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Admin only
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
            Your account does not have admin access.
          </div>
          <div className="mt-3">
            <Link to="/">
              <Button className="w-full" variant="secondary">
                Back
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Admin
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            Profiles, bots, roles, and KYC
          </div>
        </div>
        <Link to="/">
          <Button variant="ghost">Back</Button>
        </Link>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Link to="/swipe">
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-black/10 bg-gradient-to-br from-brand-100 to-lime-100 px-3 py-4 text-center shadow-sm transition hover:shadow-md active:scale-95 dark:border-white/12 dark:from-brand-500/20 dark:to-lime-500/10">
            <span className="text-2xl">🍽️</span>
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              Buyer view
            </div>
            <div className="text-[11px] text-slate-600 dark:text-zinc-400">
              Discover / Swipe
            </div>
          </div>
        </Link>
        <Link to="/requests">
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-black/10 bg-gradient-to-br from-punch-100 to-orange-100 px-3 py-4 text-center shadow-sm transition hover:shadow-md active:scale-95 dark:border-white/12 dark:from-punch-500/20 dark:to-orange-500/10">
            <span className="text-2xl">👨‍🍳</span>
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              Cook view
            </div>
            <div className="text-[11px] text-slate-600 dark:text-zinc-400">
              Requests / Matches
            </div>
          </div>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, bot, admin…"
            className="flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
          <Button
            variant="secondary"
            onClick={() => refresh()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
        <div className="mt-3">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "both", label: "Cook + buyer" },
                { v: "cook", label: "Cook only" },
                { v: "buyer", label: "Buyer only" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setSeedRole(opt.v)}
                className={[
                  "rounded-2xl border px-3 py-3 text-xs font-semibold transition",
                  seedRole === opt.v
                    ? "border-brand-500/30 bg-brand-500/15 text-slate-900 dark:text-zinc-100"
                    : "border-black/10 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-white/12 dark:bg-white/6 dark:text-zinc-200 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Count: {seedCount}
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={seedCount}
              onChange={(e) => setSeedCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => seedBots()}
            disabled={isSeeding}
          >
            {isSeeding ? "Creating bots…" : "Create bot profiles"}
          </Button>
        </div>
      </Card>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
          Active Stories — {stories.length}
        </div>
        {stories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 bg-black/2 p-4 text-center text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
            No active stories right now.
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map((s) => {
              const name = s.cook?.nickname ?? s.cook?.name ?? "Unknown cook";
              return (
                <div
                  key={s.id}
                  className="flex items-start gap-3 rounded-xl border border-black/8 bg-white p-3 dark:border-white/[0.06] dark:bg-slate-900"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                      by {name}
                      {(s.menu_items ?? []).length > 0
                        ? ` · ${(s.menu_items ?? []).join(", ")}`
                        : ""}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                      Expires{" "}
                      {new Date(s.expires_at).toLocaleString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      deleteStory(s.id).then(() => refreshStories())
                    }
                    className="flex-shrink-0 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            Loading…
          </div>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            No results.
          </div>
        ) : null}

        {filtered.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {p.nickname ?? p.name}
                </div>
                <div className="mt-1 text-xs break-all text-slate-600 dark:text-zinc-400">
                  {p.id}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/12 dark:bg-white/6 dark:text-zinc-200">
                    {p.role}
                  </span>
                  {p.is_admin ? (
                    <span className="rounded-full border border-brand-500/30 bg-brand-400/20 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                      admin
                    </span>
                  ) : null}
                  {p.is_bot ? (
                    <span className="rounded-full border border-punch-500/30 bg-punch-500/10 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                      bot
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  variant={p.is_bot ? "secondary" : "primary"}
                  onClick={() => update(p.id, { is_bot: !p.is_bot })}
                >
                  {p.is_bot ? "Unset bot" : "Set bot"}
                </Button>
                <Button
                  variant={p.is_admin ? "secondary" : "primary"}
                  onClick={() => update(p.id, { is_admin: !p.is_admin })}
                >
                  {p.is_admin ? "Unset admin" : "Set admin"}
                </Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => setRole(p.id, "buyer")}
              >
                Make buyer
              </Button>
              <Button variant="secondary" onClick={() => setRole(p.id, "cook")}>
                Make cook
              </Button>
              <Button
                variant="secondary"
                onClick={() => update(p.id, { kyc_status: "verified" })}
              >
                Verify KYC
              </Button>
              <Button
                variant="secondary"
                onClick={() => update(p.id, { kyc_status: "unverified" })}
              >
                Unverify KYC
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
