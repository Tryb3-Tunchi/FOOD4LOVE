import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Review } from "../types/db";

type UseReviewsState = {
  isLoading: boolean;
  reviews: Review[];
  hasReviewed: boolean;
  submitReview: (rating: number, comment: string | null) => Promise<void>;
};

export function useReviews(
  serviceId: string | null,
  userId: string | null
): UseReviewsState {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = useCallback(async () => {
    if (!serviceId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews((data as Review[]) ?? []);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const hasReviewed = useMemo(
    () => reviews.some((r) => r.reviewer_id === userId),
    [reviews, userId]
  );

  const submitReview = useCallback(
    async (rating: number, comment: string | null) => {
      if (!serviceId || !userId) throw new Error("Missing service or user");

      const { error } = await supabase.from("reviews").insert({
        service_id: serviceId,
        reviewer_id: userId,
        rating,
        comment: comment?.trim() || null,
      });

      if (error) throw error;
      await refresh();
    },
    [serviceId, userId, refresh]
  );

  return useMemo(
    () => ({ isLoading, reviews, hasReviewed, submitReview }),
    [isLoading, reviews, hasReviewed, submitReview]
  );
}
