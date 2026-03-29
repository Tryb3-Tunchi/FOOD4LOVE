import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { HeartIcon, XIcon } from "../components/ui/Icons";
import { useAuth } from "../hooks/useAuth";
import { useSwipe } from "../hooks/useSwipe";

export function SwipePage() {
  const { user, profile } = useAuth();

  const [filterRole, setFilterRole] = useState<"all" | "cook" | "buyer">("all");
  const [maxDistanceKm, setMaxDistanceKm] = useState(40);
  const [minAge, setMinAge] = useState<number | null>(null);
  const [maxAge, setMaxAge] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [mouseDownX, setMouseDownX] = useState<number | null>(null);
  const [mouseDownY, setMouseDownY] = useState<number | null>(null);

  const { isLoading, activeCook, like, skip, refresh } = useSwipe({
    buyerId: user?.id ?? null,
    buyerProfile: profile,
    filterRole,
    maxDistanceKm,
    minAge,
    maxAge,
    maxPrice,
  });

  const subtitle = useMemo(() => {
    const roleLabel =
      filterRole === "all"
        ? "Cooks + people"
        : filterRole === "cook"
          ? "Cooks"
          : "People";
    return `${roleLabel} • ${maxDistanceKm}km`;
  }, [filterRole, maxDistanceKm]);

  const applySwipeFromDelta = async (dx: number, dy: number) => {
    if (Math.abs(dx) < 80) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx > 0) await like();
    else await skip();
  };

  const activePhotos = useMemo(() => {
    if (!activeCook) return [];
    const base = [
      activeCook.avatar_url ?? null,
      ...(activeCook.photos ?? []),
    ].filter(Boolean) as string[];
    const unique: string[] = [];
    for (const u of base) {
      if (!unique.includes(u)) unique.push(u);
    }
    return unique.slice(0, 5);
  }, [activeCook]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [activeCook?.id]);

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            LoveFoodMatch
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            {subtitle}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/map" className="block">
            <Button variant="secondary" className="px-3 py-2">
              Map
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="px-3 py-2"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
          <Button variant="ghost" onClick={() => refresh()}>
            Refresh
          </Button>
        </div>
      </header>

      <div className="flex-1">
        <Card className="overflow-hidden p-4">
          {isLoading ? (
            <div className="text-sm text-slate-600 dark:text-zinc-300">
              Loading cooks…
            </div>
          ) : activeCook ? (
            <div className="space-y-3">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/5 dark:bg-white/8">
                {activePhotos[photoIndex] ? (
                  <img
                    src={activePhotos[photoIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onClick={() => {
                      if (activePhotos.length <= 1) return;
                      setPhotoIndex((i) => (i + 1) % activePhotos.length);
                    }}
                    onTouchStart={(e) => {
                      const t = e.touches[0];
                      setTouchStartX(t?.clientX ?? null);
                      setTouchStartY(t?.clientY ?? null);
                    }}
                    onTouchEnd={async (e) => {
                      const startX = touchStartX;
                      const startY = touchStartY;
                      setTouchStartX(null);
                      setTouchStartY(null);
                      const t = e.changedTouches[0];
                      if (startX == null || startY == null || !t) return;
                      await applySwipeFromDelta(
                        t.clientX - startX,
                        t.clientY - startY,
                      );
                    }}
                    onMouseDown={(e) => {
                      setMouseDownX(e.clientX);
                      setMouseDownY(e.clientY);
                    }}
                    onMouseUp={async (e) => {
                      const startX = mouseDownX;
                      const startY = mouseDownY;
                      setMouseDownX(null);
                      setMouseDownY(null);
                      if (startX == null || startY == null) return;
                      await applySwipeFromDelta(
                        e.clientX - startX,
                        e.clientY - startY,
                      );
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-600 dark:text-zinc-300">
                    No photo yet
                  </div>
                )}
              </div>
              {activePhotos.length > 1 ? (
                <div className="flex items-center justify-center gap-1">
                  {activePhotos.map((_, idx) => (
                    <div
                      key={idx}
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        idx === photoIndex
                          ? "bg-brand-500"
                          : "bg-black/15 dark:bg-white/15",
                      ].join(" ")}
                    />
                  ))}
                </div>
              ) : null}
              <div>
                <div className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
                  {activeCook.name}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  {activeCook.role === "cook" ? "Cook" : "Person"}
                  {activeCook.age != null ? ` • ${activeCook.age}` : ""}
                  {activeCook.role === "cook" &&
                  activeCook.price_min != null &&
                  activeCook.price_max != null
                    ? ` • ₦${activeCook.price_min}–₦${activeCook.price_max}`
                    : ""}
                </div>
                {activeCook.bio ? (
                  <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                    {activeCook.bio}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(activeCook.cuisines ?? []).slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/12 dark:bg-white/6 dark:text-zinc-200"
                    >
                      {t}
                    </span>
                  ))}
                  {(activeCook.interests ?? []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-punch-500/25 bg-punch-500/10 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-slate-600 dark:text-zinc-300">
                You're all caught up for now.
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                Try again later for more profiles.
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          className="h-14 text-base"
          onClick={() => skip()}
          disabled={!activeCook || isLoading}
          leftIcon={<XIcon className="h-5 w-5" />}
        >
          Pass
        </Button>
        <Button
          variant="primary"
          className="h-14 text-base"
          onClick={() => like()}
          disabled={!activeCook || isLoading}
          leftIcon={<HeartIcon className="h-5 w-5" />}
        >
          Like
        </Button>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Filters
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400">
                  Keep it sweet, keep it close.
                </div>
              </div>
              <Button variant="ghost" onClick={() => setIsFilterOpen(false)}>
                Done
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Show
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { v: "cook", label: "Cooks" },
                      { v: "buyer", label: "People" },
                      { v: "all", label: "Both" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setFilterRole(opt.v)}
                      className={[
                        "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                        filterRole === opt.v
                          ? "border-brand-500/30 bg-brand-500/15 text-slate-900 dark:text-zinc-100"
                          : "border-black/10 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-white/12 dark:bg-white/6 dark:text-zinc-200 dark:hover:bg-white/10",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Distance: {maxDistanceKm}km
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Min age: {minAge ?? 18}
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={60}
                    step={1}
                    value={minAge ?? 18}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setMinAge(next);
                      if (maxAge != null && next > maxAge) setMaxAge(next);
                    }}
                    className="w-full"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Max age: {maxAge ?? 60}
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={60}
                    step={1}
                    value={maxAge ?? 60}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setMaxAge(next);
                      if (minAge != null && next < minAge) setMinAge(next);
                    }}
                    className="w-full"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Max price: {maxPrice ?? 99000}₦
                </div>
                <input
                  type="range"
                  min={1000}
                  max={99000}
                  step={500}
                  value={maxPrice ?? 99000}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilterRole("all");
                    setMaxDistanceKm(40);
                    setMinAge(null);
                    setMaxAge(null);
                    setMaxPrice(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}