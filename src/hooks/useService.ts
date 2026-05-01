import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Service } from "../types/db";

type UseServiceState = {
  isLoading: boolean;
  service: Service | null;
  updateStatus: (status: Service["status"]) => Promise<void>;
  markCompleted: () => Promise<void>;
};

export function useService(matchId: string | null): UseServiceState {
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  const refresh = useCallback(async () => {
    if (!matchId) {
      setService(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("match_id", matchId)
        .maybeSingle();

      if (error) throw error;
      setService((data as Service | null) ?? null);
    } catch {
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const updateStatus = useCallback(
    async (status: Service["status"]) => {
      if (!service?.id) throw new Error("No service found");
      const { error } = await supabase
        .from("services")
        .update({ status })
        .eq("id", service.id);
      if (error) throw error;
      await refresh();
    },
    [service?.id, refresh]
  );

  const markCompleted = useCallback(async () => {
    if (!service?.id) throw new Error("No service found");
    const { error } = await supabase
      .from("services")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", service.id);
    if (error) throw error;
    await refresh();
  }, [service?.id, refresh]);

  return useMemo(
    () => ({ isLoading, service, updateStatus, markCompleted }),
    [isLoading, service, updateStatus, markCompleted]
  );
}
