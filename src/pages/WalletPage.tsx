import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ReferralBanner } from "../components/ReferralBanner";
import { useAuth } from "../hooks/useAuth";
import { useWallet, useReferral } from "../hooks/useWallet";

export function WalletPage() {
  const { user, profile } = useAuth();
  const { balance, transactions, isLoading } = useWallet(user?.id ?? null);
  const { referralCode, referrals, totalBonusEarned, generateReferralCode } = useReferral(
    user?.id ?? null
  );
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "transactions">(
    "overview"
  );

  const balanceInfo = useMemo(
    () => ({
      total: balance,
      earned: transactions
        .filter((t) => t.type === "referral" || t.type === "payment_received")
        .reduce((sum, t) => sum + t.amount, 0),
      spent: transactions
        .filter((t) => t.type === "payment_sent")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    }),
    [balance, transactions]
  );

  if (!user || !profile) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Loading wallet...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
          Food4Love Wallet
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
          Manage your credits and earnings
        </p>
      </header>

      {/* Balance Summary */}
      <Card className="mb-6 space-y-4 bg-gradient-to-br from-brand-100 to-lime-100 p-6 dark:from-brand-500/20 dark:to-lime-500/10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
            Available Balance
          </div>
          <div className="mt-2 text-4xl font-bold text-brand-700 dark:text-brand-300">
            ₦{balance.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/30">
            <div className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
              Total Earned
            </div>
            <div className="mt-1 text-lg font-bold text-green-700 dark:text-green-400">
              ₦{balanceInfo.earned.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/30">
            <div className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
              Total Spent
            </div>
            <div className="mt-1 text-lg font-bold text-red-700 dark:text-red-400">
              ₦{balanceInfo.spent.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-black/8 bg-black/4 p-1 dark:border-white/8 dark:bg-white/4">
        {(
          [
            { key: "overview", label: "Overview" },
            { key: "referrals", label: "Referrals" },
            { key: "transactions", label: "History" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-zinc-100"
                : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <ReferralBanner
            referralCode={referralCode}
            onGenerate={generateReferralCode}
            referrals={referrals}
            totalBonus={totalBonusEarned}
          />

          <Card className="space-y-3 p-4">
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Quick Actions
            </div>
            <Button variant="primary" className="w-full">
              Add Funds
            </Button>
            <Button variant="secondary" className="w-full">
              Withdraw
            </Button>
          </Card>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              About Wallet
            </div>
            <Card className="space-y-2 p-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  ✓ Referral Bonuses
                </div>
                <div className="text-[10px] text-slate-600 dark:text-zinc-400">
                  Earn ₦700 for each successful referral
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  ✓ Instant Credits
                </div>
                <div className="text-[10px] text-slate-600 dark:text-zinc-400">
                  Bonuses appear immediately after transactions
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  ✓ Use Anywhere
                </div>
                <div className="text-[10px] text-slate-600 dark:text-zinc-400">
                  Pay for services or withdraw to your bank
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <div className="space-y-4">
          <ReferralBanner
            referralCode={referralCode}
            onGenerate={generateReferralCode}
            referrals={referrals}
            totalBonus={totalBonusEarned}
          />

          <div>
            <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Referral History
            </div>
            {referrals.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  No referrals yet. Share your code to get started!
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <Card key={ref.id} className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        Referral #{ref.id.slice(0, 8)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-bold text-green-700 dark:text-green-400">
                        +₦{ref.bonus_amount.toLocaleString()}
                      </div>
                      <div
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          ref.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                        }`}
                      >
                        {ref.status === "completed" ? "Completed" : "Pending"}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="text-sm text-slate-600 dark:text-zinc-400">
                No transactions yet
              </div>
            </Card>
          ) : (
            transactions.map((txn) => (
              <Card key={txn.id} className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 capitalize">
                    {txn.type.replace(/_/g, " ")}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">
                    {txn.description ||
                      new Date(txn.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`text-xs font-bold ${
                    txn.amount > 0
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {txn.amount > 0 ? "+" : ""}₦{Math.abs(txn.amount).toLocaleString()}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-auto pt-6">
        <Link to="/profile">
          <Button variant="ghost" className="w-full">
            Back to Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
