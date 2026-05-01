import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Referral, WalletTransaction } from "../types/db";

type UseWalletState = {
  balance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  addCredit: (amount: number, type: "referral" | "admin_credit", description?: string) => Promise<boolean>;
  deductCredit: (amount: number, description?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

/**
 * Hook to manage user wallet and credits
 */
export function useWallet(userId: string | null): UseWalletState {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // Get wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", userId)
        .maybeSingle();

      if (profile) setBalance(profile.wallet_balance);

      // Get transactions
      const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      setTransactions((txns as WalletTransaction[]) ?? []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const addCredit = useCallback(
    async (amount: number, type: "referral" | "admin_credit", description?: string) => {
      if (!userId) return false;
      try {
        // Update wallet balance
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ wallet_balance: balance + amount })
          .eq("id", userId);

        if (updateError) throw updateError;

        // Record transaction
        const { error: txnError } = await supabase.from("wallet_transactions").insert({
          user_id: userId,
          amount,
          type,
          description,
        });

        if (txnError) throw txnError;

        setBalance(balance + amount);
        return true;
      } catch {
        return false;
      }
    },
    [userId, balance]
  );

  const deductCredit = useCallback(
    async (amount: number, description?: string) => {
      if (!userId || balance < amount) return false;
      try {
        // Update wallet balance
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ wallet_balance: balance - amount })
          .eq("id", userId);

        if (updateError) throw updateError;

        // Record transaction
        const { error: txnError } = await supabase.from("wallet_transactions").insert({
          user_id: userId,
          amount: -amount,
          type: "payment_sent",
          description,
        });

        if (txnError) throw txnError;

        setBalance(balance - amount);
        return true;
      } catch {
        return false;
      }
    },
    [userId, balance]
  );

  return useMemo(
    () => ({
      balance,
      transactions,
      isLoading,
      addCredit,
      deductCredit,
      refresh: load,
    }),
    [balance, transactions, isLoading, addCredit, deductCredit, load]
  );
}

type UseReferralState = {
  referralCode: string | null;
  referrals: Referral[];
  totalBonusEarned: number;
  isLoading: boolean;
  generateReferralCode: () => Promise<string | null>;
  getReferrals: () => Promise<void>;
};

/**
 * Hook to manage referral system
 */
export function useReferral(userId: string | null): UseReferralState {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // Get user's referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Get referrals by this user
      const { data: refs } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      setReferrals((refs as Referral[]) ?? []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const generateReferralCode = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      const code = `FOOD4${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("id", userId);

      if (error) throw error;

      setReferralCode(code);
      return code;
    } catch {
      return null;
    }
  }, [userId]);

  const getReferrals = useCallback(async () => {
    await load();
  }, [load]);

  const totalBonusEarned = useMemo(
    () =>
      referrals
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + r.bonus_amount, 0),
    [referrals]
  );

  return useMemo(
    () => ({
      referralCode,
      referrals,
      totalBonusEarned,
      isLoading,
      generateReferralCode,
      getReferrals,
    }),
    [referralCode, referrals, totalBonusEarned, isLoading, generateReferralCode, getReferrals]
  );
}
