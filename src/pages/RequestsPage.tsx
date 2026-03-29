import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import type { Like } from "../types/db";

export function RequestsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Like[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    const { data, error: likesError } = await supabase
      .from("likes")
      .select("*")
      .eq("cook_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (likesError) {
      setError(likesError.message);
      setIsLoading(false);
      return;
    }

    setItems((data as Like[]) ?? []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const accept = async (like: Like) => {
    setError(null);
    try {
      if (profile?.kyc_status !== "verified") {
        navigate("/kyc", { state: { from: "/requests" } });
        return;
      }

      const { error: matchError } = await supabase.from("matches").insert({
        buyer_id: like.buyer_id,
        cook_id: like.cook_id,
      });
      if (matchError) throw matchError;

      const { error: updateError } = await supabase
        .from("likes")
        .update({ status: "accepted" })
        .eq("id", like.id);

      if (updateError) throw updateError;
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept request");
    }
  };

  const reject = async (like: Like) => {
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ status: "rejected" })
        .eq("id", like.id);

      if (updateError) throw updateError;
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  };

  if (profile?.role === "cook" && profile.kyc_status !== "verified") {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
        <header className="mb-4">
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Requests
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            Verify to accept matches
          </div>
        </header>
        <Card className="p-4">
          <div className="text-sm text-slate-700 dark:text-zinc-200">
            Before you can accept a match, verify your identity.
          </div>
          <div className="mt-3">
            <Button
              className="w-full"
              variant="primary"
              onClick={() => navigate("/kyc", { state: { from: "/requests" } })}
            >
              Verify now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Requests
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            Pending likes from buyers
          </div>
        </div>
        <Button variant="ghost" onClick={() => refresh()}>
          Refresh
        </Button>
      </header>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            Loading…
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            No pending requests.
          </div>
        ) : null}

        {items.map((like) => (
          <Card key={like.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Buyer
                </div>
                <div className="mt-1 text-xs break-all text-slate-600 dark:text-zinc-400">
                  {like.buyer_id}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => reject(like)}>
                  Reject
                </Button>
                <Button variant="primary" onClick={() => accept(like)}>
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
