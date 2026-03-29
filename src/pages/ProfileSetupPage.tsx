import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/db";

export function ProfileSetupPage() {
  const { user, profile, upsertProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(profile?.role ?? "buyer");
  const [name, setName] = useState(profile?.name ?? "");
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [lookingFor, setLookingFor] = useState(profile?.looking_for ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [cuisines, setCuisines] = useState<string[]>(
    (profile?.cuisines ?? []).filter(Boolean),
  );
  const [interests, setInterests] = useState<string[]>(
    (profile?.interests ?? []).filter(Boolean),
  );
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>(
    (profile?.favorite_foods ?? []).filter(Boolean),
  );
  const [lat, setLat] = useState<number | null>(profile?.lat ?? null);
  const [lng, setLng] = useState<number | null>(profile?.lng ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cuisineOptions = [
    "Nigerian",
    "Yoruba",
    "Igbo",
    "Hausa",
    "Ghanaian",
    "West African",
    "Afro-fusion",
    "Italian",
    "Asian",
    "Mediterranean",
    "Vegan",
    "International",
  ];

  const interestOptions = [
    "Home cooking",
    "Street food",
    "Jollof parties",
    "Suya nights",
    "Fine dining",
    "Brunch",
    "Late night",
    "Comfort food",
    "Healthy eating",
    "BBQ",
    "Small chops",
    "Spicy",
  ];

  const favoriteFoodOptions = [
    "Jollof Rice",
    "Egusi Soup",
    "Pounded Yam",
    "Pepper Soup",
    "Suya",
    "Fried Plantain",
    "Efo Riro",
    "Moi Moi",
    "Ofada Rice",
    "Amala",
    "Shawarma",
    "Akara",
  ];

  const canSave = useMemo(() => {
    return (
      Boolean(user?.id) &&
      name.trim().length >= 2 &&
      cuisines.length > 0 &&
      interests.length > 0 &&
      !isSaving
    );
  }, [user?.id, name, cuisines.length, interests.length, isSaving]);

  const detectLocation = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          resolve();
        },
        () => {
          setError("Could not get your location. You can skip this for now.");
          resolve();
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  };

  const save = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const next = await upsertProfile({
        role,
        name: name.trim(),
        avatar_url: profile?.avatar_url ?? null,
        phone: phone.trim() ? phone.trim() : null,
        nickname: nickname.trim() ? nickname.trim() : null,
        looking_for: lookingFor.trim() ? lookingFor.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        cuisines: cuisines.length > 0 ? cuisines : null,
        interests: interests.length > 0 ? interests : null,
        favorite_foods: favoriteFoods.length > 0 ? favoriteFoods : null,
        lat,
        lng,
      });

      if (profile?.onboarding_completed) {
        navigate("/profile", { replace: true });
        return;
      }

      navigate(
        next.role === "buyer" ? "/onboarding/photos" : "/onboarding/cook",
        {
          replace: true,
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6">
        <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          Food4Love
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
          Set up your profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          This takes 30 seconds. You can edit later.
        </p>
      </div>

      <Card className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={[
              "rounded-xl border px-3 py-3 text-sm font-semibold transition",
              role === "buyer"
                ? "border-brand-400/60 bg-brand-500/15 text-slate-900 dark:text-zinc-100"
                : "border-black/10 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-white/15 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
            ].join(" ")}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("cook")}
            className={[
              "rounded-xl border px-3 py-3 text-sm font-semibold transition",
              role === "cook"
                ? "border-brand-400/60 bg-brand-500/15 text-slate-900 dark:text-zinc-100"
                : "border-black/10 bg-white/70 text-slate-700 hover:bg-white/90 dark:border-white/15 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
            ].join(" ")}
          >
            Cook
          </button>
        </div>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Display name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Nickname (optional)
          </div>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="What should we call you?"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            What are you here for?
          </div>
          <input
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g. Dates, food buddies, home-cooked meals"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Phone
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            inputMode="tel"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Bio
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What are you craving lately?"
            rows={3}
            className="w-full resize-none rounded-xl border border-black/10 bg-white/70 px-3 py-3 text-sm text-slate-900 outline-none ring-brand-400/40 focus:ring-2 dark:border-white/15 dark:bg-white/6 dark:text-zinc-100"
          />
        </label>

        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Favorite cuisines
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((opt) => {
              const active = cuisines.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setCuisines((prev) =>
                      prev.includes(opt)
                        ? prev.filter((x) => x !== opt)
                        : [...prev, opt],
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "border-brand-500/30 bg-brand-400/20 text-slate-900 dark:text-zinc-100"
                      : "border-black/10 bg-white/50 text-slate-700 hover:bg-white/80 dark:border-white/12 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Interests
          </div>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => {
              const active = interests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(opt)
                        ? prev.filter((x) => x !== opt)
                        : [...prev, opt],
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "border-punch-500/30 bg-punch-500/15 text-slate-900 dark:text-zinc-100"
                      : "border-black/10 bg-white/50 text-slate-700 hover:bg-white/80 dark:border-white/12 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Favorite foods
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteFoodOptions.map((opt) => {
              const active = favoriteFoods.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setFavoriteFoods((prev) =>
                      prev.includes(opt)
                        ? prev.filter((x) => x !== opt)
                        : [...prev, opt],
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "border-brand-500/30 bg-brand-400/20 text-slate-900 dark:text-zinc-100"
                      : "border-black/10 bg-white/50 text-slate-700 hover:bg-white/80 dark:border-white/12 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-3 dark:border-white/12 dark:bg-white/6">
          <div className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
            Location
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
            {lat != null && lng != null
              ? "Location saved. We use this to show people near you."
              : "Enable location to see people near you. You can skip for now."}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={detectLocation}
            variant="secondary"
            className="flex-1"
          >
            Enable location
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={!canSave}
            variant="primary"
            className="flex-1"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
