import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { MoonIcon, SunIcon, UserIcon } from "../components/ui/Icons";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const formatNaira = (n: number) => {
  if (n >= 1000) return `₦${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `₦${n}`;
};

export function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [savingParties, setSavingParties] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCook = profile?.role === "cook";

  const referralCode = profile?.referral_code ?? profile?.id?.slice(0, 8).toUpperCase() ?? null;
  const referralLink = referralCode ? `${window.location.origin}/login?ref=${referralCode}` : null;

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const whatsappShareText = referralLink
    ? `Join me on Food4Love — the app to match with cooks who come cook at your place! 🍽️\nUse my link: ${referralLink}`
    : null;

  const toggleParties = async () => {
    if (!profile || savingParties) return;
    setSavingParties(true);
    try {
      await updateProfile({ available_for_parties: !profile.available_for_parties });
    } catch {}
    finally {
      setSavingParties(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Profile
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            {user?.email ?? user?.id ?? "—"}
          </div>
        </div>
        <Button variant="ghost" onClick={() => toggleTheme()}>
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </header>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
          {profile?.avatar_url ? (
            <div className="h-32 w-full bg-black">
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
            </div>
          ) : null}
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-punch-500 text-xl font-bold text-white shadow-md">
              {profile?.name?.charAt(0)?.toUpperCase() ?? <UserIcon className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {profile?.nickname ?? profile?.name ?? "Unnamed"}
                {profile?.age ? (
                  <span className="ml-1.5 text-sm font-normal text-slate-500 dark:text-zinc-400">
                    {profile.age}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-white/8 dark:text-zinc-300">
                  {isCook ? "Cook" : "Foodie"}
                </span>
                {profile?.kyc_status === "verified" ? (
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:text-green-400">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {isCook &&
          (profile?.specialty || profile?.price_min != null) ? (
            <div className="mx-4 mb-3 rounded-xl bg-brand-500/8 px-3 py-2.5 dark:bg-brand-400/10">
              <div className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                {profile.specialty ?? "Cook"}
                {profile.price_min != null && profile.price_max != null
                  ? ` · ${formatNaira(profile.price_min)}–${formatNaira(profile.price_max)}`
                  : ""}
              </div>
            </div>
          ) : null}

          {profile?.bio ? (
            <div className="mx-4 mb-3">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {profile.bio}
              </p>
            </div>
          ) : null}

          {(profile?.cuisines ?? []).length > 0 ? (
            <div className="mx-4 mb-4 flex flex-wrap gap-1.5">
              {(profile?.cuisines ?? []).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300"
                >
                  {c}
                </span>
              ))}
              {(profile?.interests ?? []).slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-punch-500/8 px-2.5 py-1 text-xs font-semibold text-punch-700 dark:text-punch-300"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
          <div className="divide-y divide-black/6 dark:divide-white/6">
            <Link to="/setup" className="block">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-black/3 active:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/5"
              >
                <span>✏️ Edit profile</span>
                <span className="text-slate-400">›</span>
              </button>
            </Link>

            {isCook ? (
              <Link to="/onboarding/cook" className="block">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-black/3 active:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/5"
                >
                  <span>🧑‍🍳 Cook profile & stories</span>
                  <span className="text-slate-400">›</span>
                </button>
              </Link>
            ) : null}

            <Link
              to="/kyc"
              state={{ from: "/profile" }}
              className="block"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-black/3 active:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/5"
              >
                <span>
                  {profile?.kyc_status === "verified"
                    ? "✅ Identity verified"
                    : "🪪 Verify identity"}
                </span>
                <span className="text-slate-400">›</span>
              </button>
            </Link>

            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10"
              onClick={() => signOut()}
            >
              <span>Sign out</span>
              <span className="text-red-400">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
