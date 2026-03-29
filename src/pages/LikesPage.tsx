import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import type { Like, Profile, Swipe } from "../types/db";

type Item = Like & { otherProfile: Profile | null };
type LikedYouItem = Swipe & { otherProfile: Profile | null };

const statusLabel: Record<Like["status"], string> = {
  pending: "Pending",
  accepted: "Matched",
  rejected: "Passed",
};

export function LikesPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [likedYou, setLikedYou] = useState<LikedYouItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    "pending" | "matched" | "passed" | "liked_you"
  >("pending");

  const refresh = useCallback(async () => {
    if (!user?.id || !profile) {
      setItems([]);
      setLikedYou([]);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    const { data: swipeRows, error: swipesError } = await supabase
      .from("swipes")
      .select("*")
      .eq("target_id", user.id)
      .eq("direction", "like")
      .order("created_at", { ascending: false });
    if (swipesError) {
      setError(swipesError.message);
      setIsLoading(false);
      return;
    }

    const base = supabase.from("likes").select("*").order("created_at", {
      ascending: false,
    });
    const { data, error: likesError } =
      profile.role === "cook"
        ? await base.eq("cook_id", user.id)
        : await base.eq("buyer_id", user.id);

    if (likesError) {
      setError(likesError.message);
      setIsLoading(false);
      return;
    }

    const likes = (data as Like[]) ?? [];
    const swipes = (swipeRows as Swipe[]) ?? [];
    const otherIds = Array.from(
      new Set([
        ...likes.map((l) => (profile.role === "cook" ? l.buyer_id : l.cook_id)),
        ...swipes.map((s) => s.swiper_id),
      ]),
    );

    let profilesById = new Map<string, Profile>();
    if (otherIds.length > 0) {
      const { data: profileRows, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherIds);

      if (profilesError) {
        setError(profilesError.message);
        setIsLoading(false);
        return;
      }

      profilesById = new Map(
        ((profileRows as Profile[]) ?? []).map((p) => [p.id, p]),
      );
    }

    setItems(
      likes.map((l) => ({
        ...l,
        otherProfile:
          profilesById.get(profile.role === "cook" ? l.buyer_id : l.cook_id) ??
          null,
      })),
    );

    setLikedYou(
      swipes.map((s) => ({
        ...s,
        otherProfile: profilesById.get(s.swiper_id) ?? null,
      })),
    );
    setIsLoading(false);
  }, [profile, user?.id]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const accept = async (like: Like) => {
    setError(null);
    try {
      if (profile?.role === "cook" && profile.kyc_status !== "verified") {
        navigate("/kyc", { state: { from: "/likes" } });
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
      setError(err instanceof Error ? err.message : "Failed to accept");
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
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  const title = useMemo(() => {
    if (profile?.role === "cook") return "Likes you";
    return "Your likes";
  }, [profile?.role]);

  const subtitle = useMemo(() => {
    if (profile?.role === "cook") return "People who swiped right on you";
    return "Your swipes and match status";
  }, [profile?.role]);

  const filtered = useMemo(() => {
    if (!profile) return [];
    if (tab === "liked_you") return [];
    if (tab === "pending") return items.filter((x) => x.status === "pending");
    if (tab === "matched") return items.filter((x) => x.status === "accepted");
    return items.filter((x) => x.status === "rejected");
  }, [items, profile, tab]);

  const likeBack = async (targetId: string) => {
    if (!user?.id || !profile) return;
    setError(null);
    try {
      const target =
        likedYou.find((x) => x.swiper_id === targetId)?.otherProfile ?? null;
      if (target?.role === "buyer" && profile.kyc_status !== "verified") {
        navigate("/kyc", { state: { from: "/likes" } });
        return;
      }

      const { error: swipeError } = await supabase.from("swipes").upsert({
        swiper_id: user.id,
        target_id: targetId,
        direction: "like",
      });
      if (swipeError) throw swipeError;

      if (target?.role === "cook") {
        const { error: likeError } = await supabase.from("likes").upsert({
          buyer_id: user.id,
          cook_id: targetId,
          status: "pending",
        });
        if (likeError) throw likeError;
      }

      const a = user.id;
      const b = targetId;
      const buyer_id = a < b ? a : b;
      const cook_id = a < b ? b : a;
      const { error: matchError } = await supabase.from("matches").upsert({
        buyer_id,
        cook_id,
      });
      if (matchError) throw matchError;

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  if (profile?.role === "cook" && profile.kyc_status !== "verified") {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
        <header className="mb-4">
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Likes you
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            Verify to manage likes
          </div>
        </header>
        <Card className="p-4">
          <div className="text-sm text-slate-700 dark:text-zinc-200">
            Verify your identity to accept matches and start chatting.
          </div>
          <div className="mt-3">
            <Button
              className="w-full"
              variant="primary"
              onClick={() => navigate("/kyc", { state: { from: "/likes" } })}
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
            {title}
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            {subtitle}
          </div>
        </div>
        <Button variant="ghost" onClick={() => refresh()}>
          Refresh
        </Button>
      </header>

      <div className="mb-4 rounded-2xl border border-black/10 bg-black/5 p-1 dark:border-white/12 dark:bg-white/8">
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={[
              "rounded-2xl px-3 py-2 text-xs font-semibold transition",
              tab === "pending"
                ? "bg-white text-slate-950 shadow-[0_10px_18px_-14px_rgba(2,6,23,0.35)] dark:bg-white/12 dark:text-zinc-50"
                : "text-slate-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10",
            ].join(" ")}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setTab("matched")}
            className={[
              "rounded-2xl px-3 py-2 text-xs font-semibold transition",
              tab === "matched"
                ? "bg-white text-slate-950 shadow-[0_10px_18px_-14px_rgba(2,6,23,0.35)] dark:bg-white/12 dark:text-zinc-50"
                : "text-slate-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10",
            ].join(" ")}
          >
            Matched
          </button>
          <button
            type="button"
            onClick={() => setTab("passed")}
            className={[
              "rounded-2xl px-3 py-2 text-xs font-semibold transition",
              tab === "passed"
                ? "bg-white text-slate-950 shadow-[0_10px_18px_-14px_rgba(2,6,23,0.35)] dark:bg-white/12 dark:text-zinc-50"
                : "text-slate-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10",
            ].join(" ")}
          >
            Passed
          </button>
        </div>
        {profile?.role === "buyer" ? (
          <div className="mt-2 px-2">
            <button
              type="button"
              onClick={() => setTab("liked_you")}
              className={[
                "w-full rounded-2xl px-3 py-2 text-xs font-semibold transition",
                tab === "liked_you"
                  ? "bg-white text-slate-950 shadow-[0_10px_18px_-14px_rgba(2,6,23,0.35)] dark:bg-white/12 dark:text-zinc-50"
                  : "text-slate-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10",
              ].join(" ")}
            >
              Liked you
            </button>
          </div>
        ) : null}
      </div>

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

        {tab === "liked_you" && !isLoading && likedYou.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            No one has liked you yet.
          </div>
        ) : null}

        {!isLoading && tab !== "liked_you" && filtered.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-zinc-300">
            Nothing yet.
          </div>
        ) : null}

        {tab === "liked_you"
          ? likedYou.map((s) => {
              const name =
                s.otherProfile?.nickname ?? s.otherProfile?.name ?? s.swiper_id;
              const role = s.otherProfile?.role ?? "buyer";
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {name}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                        {role === "cook" ? "Cook" : "Person"}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="primary"
                        onClick={() => likeBack(s.swiper_id)}
                      >
                        Like back
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          : null}

        {filtered.map((like) => {
          const name =
            like.otherProfile?.name ??
            (profile?.role === "cook" ? like.buyer_id : like.cook_id);
          const status = statusLabel[like.status];

          return (
            <Card key={like.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {name}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                    {status}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {profile?.role === "cook" && like.status === "pending" ? (
                    <>
                      <Button variant="secondary" onClick={() => reject(like)}>
                        Pass
                      </Button>
                      <Button variant="primary" onClick={() => accept(like)}>
                        Match
                      </Button>
                    </>
                  ) : null}

                  {profile?.role === "buyer" && like.status === "accepted" ? (
                    <Link to="/matches">
                      <Button variant="primary">Chat</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
