import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { MoonIcon, SunIcon, UserIcon } from "../components/ui/Icons";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Profile
          </div>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
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

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-zinc-200">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900 dark:text-zinc-100">
              {profile?.nickname ?? profile?.name ?? "Unnamed"}
            </div>
            <div className="text-sm text-slate-600 dark:text-zinc-400">
              {profile?.role ?? "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Link to="/kyc" state={{ from: "/profile" }} className="block">
            <Button
              variant={profile?.kyc_status === "verified" ? "secondary" : "primary"}
              className="w-full"
            >
              {profile?.kyc_status === "verified"
                ? "Identity verified"
                : "Verify identity"}
            </Button>
          </Link>

          <Link to="/setup" className="block">
            <Button variant="secondary" className="w-full">
              Edit profile
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
