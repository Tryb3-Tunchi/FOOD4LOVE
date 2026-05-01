import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CookEarnings } from "../types/db";

type UseEarningsState = {
  earnings: CookEarnings[];
  isLoading: boolean;
  totalEarned: number;
  totalPaid: number;
  totalUnpaid: number;
  monthlyEarnings: { [month: string]: number };
  refresh: () => Promise<void>;
};

/**
 * Hook to load cook earnings and payment tracking
 */
export function useEarnings(cookId: string | null): UseEarningsState {
  const [earnings, setEarnings] = useState<CookEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!cookId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("cook_earnings")
        .select("*")
        .eq("cook_id", cookId)
        .order("created_at", { ascending: false });
      setEarnings((data as CookEarnings[]) ?? []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [cookId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const { totalEarned, totalPaid, totalUnpaid, monthlyEarnings } = useMemo(() => {
    let earned = 0;
    let paid = 0;
    let unpaid = 0;
    const monthly: { [month: string]: number } = {};

    earnings.forEach((e) => {
      earned += e.amount_earned;
      if (e.status === "paid") paid += e.amount_paid;
      else unpaid += e.amount_earned;

      // Group by month (YYYY-MM)
      const month = e.created_at.substring(0, 7);
      monthly[month] = (monthly[month] ?? 0) + e.amount_earned;
    });

    return {
      totalEarned: earned,
      totalPaid: paid,
      totalUnpaid: unpaid,
      monthlyEarnings: monthly,
    };
  }, [earnings]);

  return useMemo(
    () => ({
      earnings,
      isLoading,
      totalEarned,
      totalPaid,
      totalUnpaid,
      monthlyEarnings,
      refresh: load,
    }),
    [earnings, isLoading, totalEarned, totalPaid, totalUnpaid, monthlyEarnings, load]
  );
}
