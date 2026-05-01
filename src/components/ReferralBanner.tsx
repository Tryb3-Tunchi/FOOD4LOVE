import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import type { Referral } from "../types/db";

type ReferralBannerProps = {
  referralCode: string | null;
  onGenerate: () => Promise<void>;
  referrals: Referral[];
  totalBonus: number;
  isLoading?: boolean;
};

export function ReferralBanner({
  referralCode,
  onGenerate,
  referrals,
  totalBonus,
  isLoading = false,
}: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
    }
  };

  const handleShare = () => {
    if (referralCode) {
      const text = `Join Food4Love with my referral code: ${referralCode} - Get ₦700 bonus on your first transaction!`;
      if (navigator.share) {
        navigator.share({
          title: "Food4Love Referral",
          text,
        });
      } else {
        navigator.clipboard.writeText(text);
        setCopied(true);
      }
    }
  };

  return (
    <Card className="space-y-4 bg-gradient-to-br from-brand-50 to-lime-50 p-4 dark:from-brand-500/10 dark:to-lime-500/10">
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
          🎁 Earn with Referrals
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
          Invite friends and earn ₦700 for each successful referral
        </p>
      </div>

      <div className="space-y-2">
        {referralCode ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-brand-200 bg-white/50 px-3 py-2 text-sm font-mono text-brand-700 dark:border-brand-500/30 dark:bg-slate-900/30 dark:text-brand-300">
                {referralCode}
              </div>
              <Button
                variant={copied ? "primary" : "secondary"}
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? "✓" : "Copy"}
              </Button>
            </div>

            <Button variant="secondary" className="w-full" onClick={handleShare}>
              Share Code
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating…" : "Get Referral Code"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/50 p-2 dark:bg-slate-900/30">
          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
            {referrals.length}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-zinc-400">
            {referrals.length === 1 ? "Referral" : "Referrals"}
          </div>
        </div>
        <div className="rounded-lg bg-white/50 p-2 dark:bg-slate-900/30">
          <div className="text-xs font-bold text-green-700 dark:text-green-300">
            ₦{totalBonus.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-600 dark:text-zinc-400">
            Bonus Earned
          </div>
        </div>
      </div>
    </Card>
  );
}
