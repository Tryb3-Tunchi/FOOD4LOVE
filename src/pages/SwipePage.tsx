import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { HeartIcon, InfoIcon, XIcon } from "../components/ui/Icons";
import { useAuth } from "../hooks/useAuth";
import { useSwipe } from "../hooks/useSwipe";
import type { Profile } from "../types/db";

const formatNaira = (n: number) => {
  if (n >= 1000) return `₦${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `₦${n}`;
};

function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : String(value);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
          {label}
        </span>
        <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-sm font-bold text-brand-700 dark:bg-brand-400/20 dark:text-brand-300">
          {display}
        </span>
      </div>
      <div className="relative py-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

function ProfileInfoSheet({
  profile,
  photos,
  onClose,
  onLike,
  onSkip,
}: {
  profile: Profile;
  photos: string[];
  onClose: () => void;
  onLike: () => void;
  onSkip: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);

  const sectionLabel = "text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2";
  const tagCls = "rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-zinc-200";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-950">
        <div className="relative h-[52vw] max-h-80 min-h-52 flex-shrink-0 overflow-hidden bg-black">
          {photos[photoIdx] ? (
            <img
              src={photos[photoIdx]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No photo</div>
          )}

          {photos.length > 1 && (
            <div className="absolute left-0 right-0 top-2 flex gap-1 px-3">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoIdx(idx)}
                  className={[
                    "h-0.5 flex-1 rounded-full transition-all",
                    idx === photoIdx ? "bg-white" : "bg-white/30",
                  ].join(" ")}
                />
              ))}
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-0 top-0 h-full w-1/3"
                onClick={() => setPhotoIdx((i) => (i === 0 ? photos.length - 1 : i - 1))}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full w-1/3"
                onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
              />
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.47 4.47a.75.75 0 011.06 0L8 6.94l2.47-2.47a.75.75 0 111.06 1.06L9.06 8l2.47 2.47a.75.75 0 11-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 01-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 010-1.06z" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
            <div className="text-2xl font-bold text-white">
              {profile.name}
              {profile.age != null && (
                <span className="ml-2 text-xl font-semibold opacity-90">{profile.age}</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-white/80">
              <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                {profile.role === "cook" ? "Cook" : "Foodie"}
              </span>
              {profile.specialty && (
                <span className="text-white/70">{profile.specialty}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {profile.role === "cook" && profile.price_min != null && profile.price_max != null && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-brand-500/10 px-4 py-3 dark:bg-brand-400/10">
              <div className="text-2xl">🍽️</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">
                  Session Rate
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {formatNaira(profile.price_min)} – {formatNaira(profile.price_max)}
                </div>
              </div>
            </div>
          )}

          {profile.bio && (
            <div className="mb-5">
              <div className={sectionLabel}>About</div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.looking_for && (
            <div className="mb-5">
              <div className={sectionLabel}>Looking for</div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {profile.looking_for}
              </p>
            </div>
          )}

          {(profile.cuisines ?? []).length > 0 && (
            <div className="mb-5">
              <div className={sectionLabel}>
                {profile.role === "cook" ? "Cuisines" : "Cuisine Preferences"}
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.cuisines ?? []).map((c) => (
                  <span key={c} className={tagCls}>🍲 {c}</span>
                ))}
              </div>
            </div>
          )}

          {(profile.interests ?? []).length > 0 && (
            <div className="mb-5">
              <div className={sectionLabel}>Interests</div>
              <div className="flex flex-wrap gap-2">
                {(profile.interests ?? []).map((t) => (
                  <span key={t} className={tagCls}>✦ {t}</span>
                ))}
              </div>
            </div>
          )}

          {(profile.favorite_foods ?? []).length > 0 && (
            <div className="mb-5">
              <div className={sectionLabel}>
                {profile.role === "cook" ? "Signature Dishes" : "Favourite Foods"}
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.favorite_foods ?? []).map((f) => (
                  <span key={f} className={tagCls}>🔥 {f}</span>
                ))}
              </div>
            </div>
          )}

          <div className="h-24" />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 border-t border-black/8 bg-white/95 py-4 backdrop-blur dark:border-white/8 dark:bg-slate-950/95">
          <button
            type="button"
            onClick={() => { onSkip(); onClose(); }}
            className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/40 bg-white shadow-lg transition hover:border-red-400 hover:shadow-red-400/20 active:scale-90 dark:bg-slate-900"
          >
            <XIcon className="h-6 w-6 text-red-400 transition group-hover:scale-110" />
          </button>
          <button
            type="button"
            onClick={() => { onLike(); onClose(); }}
            className="group flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/30 transition hover:shadow-brand-500/50 hover:scale-105 active:scale-95"
            style={{ width: 72, height: 72 }}
          >
            <HeartIcon className="h-8 w-8 text-white transition group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SwipePage() {
  const { user, profile } = useAuth();

  const [filterRole, setFilterRole] = useState<"all" | "cook" | "buyer">("cook");
  const [maxDistanceKm, setMaxDistanceKm] = useState(40);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(50);
  const [maxPrice, setMaxPrice] = useState(99000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [mouseDownX, setMouseDownX] = useState<number | null>(null);
  const [mouseDownY, setMouseDownY] = useState<number | null>(null);
  const [swipeAnim, setSwipeAnim] = useState<"like" | "nope" | null>(null);

  const { isLoading, activeCook, like, skip, refresh, isExhausted } = useSwipe({
    buyerId: user?.id ?? null,
    buyerProfile: profile,
    filterRole,
    maxDistanceKm,
    minAge,
    maxAge,
    maxPrice,
  });

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
    setSwipeAnim(null);
    setIsInfoOpen(false);
  }, [activeCook?.id]);

  const applySwipeFromDelta = async (dx: number, dy: number) => {
    if (Math.abs(dx) < 80) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx > 0) {
      setSwipeAnim("like");
      await new Promise((r) => setTimeout(r, 200));
      await like();
    } else {
      setSwipeAnim("nope");
      await new Promise((r) => setTimeout(r, 200));
      await skip();
    }
  };

  const handleLike = async () => {
    setSwipeAnim("like");
    await new Promise((r) => setTimeout(r, 200));
    await like();
  };

  const handleSkip = async () => {
    setSwipeAnim("nope");
    await new Promise((r) => setTimeout(r, 200));
    await skip();
  };

  const roleLabel =
    filterRole === "all"
      ? "Cooks + People"
      : filterRole === "cook"
        ? "Cooks"
        : "People";

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Food4Love
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            {roleLabel} · {maxDistanceKm}km · {minAge}–{maxAge}yrs
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/map" className="block">
            <Button variant="secondary" className="px-3 py-2 text-xs">
              Map
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:shadow active:scale-95 dark:border-white/12 dark:bg-white/8 dark:text-zinc-200 dark:hover:bg-white/12"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1zm2 4a1 1 0 0 1 1-1h8a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm2 4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1z" />
            </svg>
            Filter
          </button>
          <button
            type="button"
            onClick={() => refresh()}
            className="rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:shadow active:scale-95 dark:border-white/12 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
          >
            ↻
          </button>
        </div>
      </header>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex h-[460px] items-center justify-center">
            <div className="text-sm text-slate-400 dark:text-zinc-500">Loading…</div>
          </div>
        ) : isExhausted ? (
          <div className="flex h-[460px] flex-col items-center justify-center gap-4 text-center">
            <div className="text-5xl">🍽️</div>
            <div className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              You've seen everyone!
            </div>
            <div className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              We're still growing — more cooks are joining every day. Come back
              soon or adjust your filters to find more.
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsFilterOpen(true)}>
                Adjust Filters
              </Button>
              <Button variant="primary" onClick={() => refresh()}>
                Check Again
              </Button>
            </div>
          </div>
        ) : activeCook ? (
          <div
            className="relative"
            style={{
              transform:
                swipeAnim === "like"
                  ? "translateX(60px) rotate(8deg)"
                  : swipeAnim === "nope"
                    ? "translateX(-60px) rotate(-8deg)"
                    : "none",
              opacity: swipeAnim ? 0 : 1,
              transition: swipeAnim ? "all 0.2s ease-out" : "none",
            }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl dark:shadow-black/60">
              <div
                className="aspect-[4/5] w-full overflow-hidden"
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
                  await applySwipeFromDelta(t.clientX - startX, t.clientY - startY);
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
                  await applySwipeFromDelta(e.clientX - startX, e.clientY - startY);
                }}
              >
                {activePhotos[photoIndex] ? (
                  <img
                    src={activePhotos[photoIndex]}
                    alt=""
                    className="h-full w-full select-none object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-400">
                    No photo yet
                  </div>
                )}

                {activePhotos.length > 1 && (
                  <div className="absolute left-0 right-0 top-2 flex gap-1 px-2">
                    {activePhotos.map((_, idx) => (
                      <div
                        key={idx}
                        className={[
                          "h-0.5 flex-1 rounded-full transition-all",
                          idx === photoIndex ? "bg-white" : "bg-white/30",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}

                {activePhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-0 top-0 h-full w-1/2"
                      onClick={() =>
                        setPhotoIndex((i) => (i === 0 ? activePhotos.length - 1 : i - 1))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full w-1/2"
                      onClick={() => setPhotoIndex((i) => (i + 1) % activePhotos.length)}
                    />
                  </>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-5 pt-16">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {activeCook.name}
                        {activeCook.age != null ? (
                          <span className="ml-2 text-xl font-semibold opacity-90">
                            {activeCook.age}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-sm font-medium text-white/80">
                        {activeCook.role === "cook" ? "Cook" : "Foodie"}
                        {activeCook.specialty ? ` · ${activeCook.specialty}` : ""}
                        {activeCook.role === "cook" &&
                        activeCook.price_min != null &&
                        activeCook.price_max != null
                          ? ` · ${formatNaira(activeCook.price_min)}–${formatNaira(activeCook.price_max)}`
                          : ""}
                      </div>
                      {activeCook.bio ? (
                        <div className="mt-1.5 line-clamp-2 text-sm leading-snug text-white/70">
                          {activeCook.bio}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInfoOpen(true)}
                      className="group mb-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-sm transition hover:bg-white/25 active:scale-90"
                    >
                      <InfoIcon className="h-5 w-5 text-white transition group-hover:scale-110" />
                    </button>
                  </div>

                  {((activeCook.cuisines ?? []).length > 0 ||
                    (activeCook.interests ?? []).length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(activeCook.cuisines ?? []).slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
                        >
                          {t}
                        </span>
                      ))}
                      {(activeCook.interests ?? []).slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={handleSkip}
          disabled={!activeCook || isLoading || isExhausted}
          className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400/40 bg-white shadow-lg transition hover:border-red-400 hover:shadow-lg hover:shadow-red-400/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30 dark:bg-slate-900 dark:hover:shadow-red-400/15"
        >
          <XIcon className="h-7 w-7 text-red-400 transition group-hover:scale-110" />
        </button>

        <button
          type="button"
          onClick={handleLike}
          disabled={!activeCook || isLoading || isExhausted}
          className="group flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/30 transition hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
        >
          <HeartIcon className="h-9 w-9 text-white transition group-hover:scale-110" />
        </button>

        <button
          type="button"
          disabled={!activeCook || isLoading || isExhausted}
          onClick={() => setIsInfoOpen(true)}
          className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-sky-400/40 bg-white shadow-lg transition hover:border-sky-400 hover:shadow-lg hover:shadow-sky-400/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30 dark:bg-slate-900 dark:hover:shadow-sky-400/15"
        >
          <InfoIcon className="h-6 w-6 text-sky-400 transition group-hover:scale-110" />
        </button>
      </div>

      {isInfoOpen && activeCook ? (
        <ProfileInfoSheet
          profile={activeCook}
          photos={activePhotos}
          onClose={() => setIsInfoOpen(false)}
          onLike={handleLike}
          onSkip={handleSkip}
        />
      ) : null}

      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFilterOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-black/10 dark:bg-white/10" />

            <div className="px-5 pb-8 pt-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Discovery Settings
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400">
                    Swipe smarter, eat better
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full bg-black/6 p-2 text-slate-600 transition hover:bg-black/10 active:scale-90 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.47 4.47a.75.75 0 011.06 0L8 6.94l2.47-2.47a.75.75 0 111.06 1.06L9.06 8l2.47 2.47a.75.75 0 11-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 01-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 010-1.06z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-3 text-sm font-bold text-slate-700 dark:text-zinc-200">
                    Show Me
                  </div>
                  <div className="flex rounded-2xl border border-black/8 bg-black/4 p-1 dark:border-white/8 dark:bg-white/4">
                    {(
                      [
                        { v: "cook", label: "Cooks" },
                        { v: "all", label: "Everyone" },
                        { v: "buyer", label: "Buyers" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setFilterRole(opt.v)}
                        className={[
                          "flex-1 rounded-xl py-2.5 text-sm font-semibold transition active:scale-95",
                          filterRole === opt.v
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-zinc-100"
                            : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <RangeSlider
                  label="Maximum Distance"
                  min={1}
                  max={40}
                  step={1}
                  value={maxDistanceKm}
                  onChange={setMaxDistanceKm}
                  format={(v) => `${v} km`}
                />

                <div>
                  <div className="mb-2 text-sm font-bold text-slate-700 dark:text-zinc-200">
                    Age Range
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <RangeSlider
                      label="Min"
                      min={18}
                      max={60}
                      step={1}
                      value={minAge}
                      onChange={(v) => {
                        setMinAge(v);
                        if (v > maxAge) setMaxAge(v);
                      }}
                      format={(v) => `${v}`}
                    />
                    <RangeSlider
                      label="Max"
                      min={18}
                      max={60}
                      step={1}
                      value={maxAge}
                      onChange={(v) => {
                        setMaxAge(v);
                        if (v < minAge) setMinAge(v);
                      }}
                      format={(v) => `${v}`}
                    />
                  </div>
                </div>

                <RangeSlider
                  label="Max Budget"
                  min={1000}
                  max={99000}
                  step={500}
                  value={maxPrice}
                  onChange={setMaxPrice}
                  format={formatNaira}
                />

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterRole("cook");
                      setMaxDistanceKm(40);
                      setMinAge(18);
                      setMaxAge(50);
                      setMaxPrice(99000);
                    }}
                    className="flex-1 rounded-2xl border border-black/10 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-black/4 active:scale-95 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/6"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-600 hover:to-brand-700 active:scale-95"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
