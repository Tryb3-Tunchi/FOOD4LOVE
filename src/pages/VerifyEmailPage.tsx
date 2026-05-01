import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

export function VerifyEmailPage() {
  const { emailVerified, resendSignupEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = (params.get("email") ?? "").trim();

  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canResend = useMemo(() => {
    if (isSending) return false;
    return email.includes("@");
  }, [email, isSending]);

  // Auto-redirect if email is verified
  useEffect(() => {
    if (emailVerified) {
      navigate("/setup", { replace: true });
    }
  }, [emailVerified, navigate]);

  // Auto-check verification every 3 seconds
  useEffect(() => {
    if (emailVerified) return;
    
    const checkInterval = setInterval(async () => {
      setIsChecking(true);
      try {
        await refreshProfile();
      } catch {
        // Silently fail, we'll check again in 3 seconds
      } finally {
        setIsChecking(false);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [emailVerified, refreshProfile]);

  const resend = async () => {
    setError(null);
    setStatus(null);
    setIsSending(true);
    try {
      await resendSignupEmail(email);
      setStatus("Sent. Check your inbox (and spam).");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed";
      const lower = message.toLowerCase();
      if (lower.includes("rate limit")) {
        setError(
          "Email rate limit exceeded. Wait a little and try again, or use a different email while testing.",
        );
      } else {
        setError(message);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-tight text-slate-950 dark:text-zinc-50">
          Food4Love
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
          We sent a verification link to{" "}
          <span className="font-semibold">{email || "your email"}</span>.
        </p>
      </div>

      <Card className="space-y-3 border-black/10 bg-white/92 p-5 shadow-[0_26px_60px_-30px_rgba(2,6,23,0.25)] dark:border-white/12 dark:bg-slate-950/55 dark:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.9)]">
        <div className="text-sm text-slate-700 dark:text-zinc-200">
          {isChecking ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500"></span>
              Checking verification…
            </span>
          ) : (
            "Click the link in your email to verify. We'll automatically detect it."
          )}
        </div>

        <Button
          className="w-full"
          variant="primary"
          onClick={() => resend()}
          disabled={!canResend || isSending}
        >
          {isSending ? "Resending…" : "Resend verification email"}
        </Button>

        <Link to="/login" className="block">
          <Button className="w-full" variant="secondary">
            Back to sign in
          </Button>
        </Link>

        {status ? (
          <div className="rounded-2xl border border-black/10 bg-white/70 p-3 text-sm text-slate-700 dark:border-white/15 dark:bg-white/6 dark:text-zinc-200">
            {status}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

