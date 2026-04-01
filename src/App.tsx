import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Button } from "./components/ui/Button";
import {
  ChatIcon,
  CompassIcon,
  HeartIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
} from "./components/ui/Icons";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import {
  isSupabaseConfigured,
  supabaseConfigErrorMessage,
} from "./lib/supabase";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { BuyerPhotosPage } from "./pages/BuyerPhotosPage";
import { ChatPage } from "./pages/ChatPage";
import { CookOnboardingPage } from "./pages/CookOnboardingPage";
import { FunPage } from "./pages/FunPage";
import { AdminPage } from "./pages/AdminPage";
import { KycPage } from "./pages/KycPage";
import { LikesPage } from "./pages/LikesPage";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";
import { MatchesPage } from "./pages/MatchesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { RequestsPage } from "./pages/RequestsPage";
import { SwipePage } from "./pages/SwipePage";
import { CookPublicPage } from "./pages/CookPublicPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

function SupabaseConfigScreen() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
        <div className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          Food4Love
        </div>
        <h1 className="mt-2 text-xl font-semibold text-zinc-50">
          Supabase env not configured
        </h1>
        <div className="mt-2 text-sm text-zinc-300">
          {supabaseConfigErrorMessage ?? "Missing environment variables."}
        </div>
        <div className="mt-4 space-y-2 text-sm text-zinc-400">
          <div>1) Open .env.local and set:</div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-3 font-mono text-[12px] leading-relaxed text-zinc-200">
            VITE_SUPABASE_URL=...
            <br />
            VITE_SUPABASE_ANON_KEY=...
          </div>
          <div>2) Restart dev server.</div>
        </div>
      </div>
    </div>
  );
}

function RequireAuth() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading)
    return <div className="p-6 text-sm text-zinc-300">Loading…</div>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function RequireProfile() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/setup" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/setup" replace />;
  if (!profile.is_admin) return <Navigate to="/" replace />;
  return <Outlet />;
}

function RequireOnboarding() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/setup" replace />;
  if (!profile.onboarding_completed) {
    return (
      <Navigate
        to={
          profile.role === "buyer" ? "/onboarding/photos" : "/onboarding/cook"
        }
        replace
      />
    );
  }
  return <Outlet />;
}

function RoleIndexRedirect() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/setup" replace />;
  if (profile.is_admin) return <Navigate to="/admin" replace />;
  return (
    <Navigate to={profile.role === "cook" ? "/requests" : "/swipe"} replace />
  );
}

function Shell() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isChat = location.pathname.startsWith("/chat/");

  const discoverPath = profile?.role === "cook" ? "/requests" : "/swipe";
  const discoverLabel = profile?.role === "cook" ? "Discover" : "Discover";

  const navItems = profile?.is_admin
    ? [
        { to: "/admin", label: "Admin", Icon: SparklesIcon },
        { to: discoverPath, label: discoverLabel, Icon: CompassIcon },
        { to: "/likes", label: "Likes", Icon: HeartIcon },
        { to: "/matches", label: "Chats", Icon: ChatIcon },
        { to: "/profile", label: "Profile", Icon: UserIcon },
      ]
    : [
        { to: discoverPath, label: discoverLabel, Icon: CompassIcon },
        { to: "/likes", label: "Likes", Icon: HeartIcon },
        { to: "/matches", label: "Chats", Icon: ChatIcon },
        { to: "/profile", label: "Profile", Icon: UserIcon },
        { to: "/fun", label: "Fun", Icon: SparklesIcon },
      ];

  return (
    <div className="min-h-svh">
      <Outlet />
      {!isChat ? (
        <nav className="sticky bottom-0 mx-auto w-full max-w-md px-4 pb-4">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-2 backdrop-blur shadow-lg dark:border-white/[0.08] dark:bg-slate-900/90 dark:shadow-black/40">
            <div className="flex items-center justify-between gap-2">
              <div className="grid flex-1 grid-cols-5 gap-1">
                {navItems.map(({ to, label, Icon }) => {
                  const isActive =
                    location.pathname === to ||
                    location.pathname.startsWith(to + "/");

                  return (
                    <Link key={to} to={to} className="block">
                      <button
                        type="button"
                        className={[
                          "flex w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition",
                          isActive
                            ? "bg-brand-500/15 text-brand-800 dark:bg-brand-500/18 dark:text-brand-200"
                            : "text-slate-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="leading-none">{label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
              <Button variant="ghost" onClick={() => toggleTheme()}>
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/cook/:id" element={<CookPublicPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/setup" element={<ProfileSetupPage />} />
        <Route element={<RequireProfile />}>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/onboarding/photos" element={<BuyerPhotosPage />} />
          <Route path="/onboarding/cook" element={<CookOnboardingPage />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<Shell />}>
              <Route path="/" element={<RoleIndexRedirect />} />
              <Route path="/swipe" element={<SwipePage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/likes" element={<LikesPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/chat/:matchId" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/fun" element={<FunPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <SupabaseConfigScreen />;
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
