"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import type {
  CoParentingEvent,
  CoParentingEventType,
  CoParentingSchedule,
  Milestone,
} from "@/types/database";

async function postJson(url: string, payload: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !body.ok) {
    throw new Error(body.error || "Something went wrong");
  }
  return body;
}

/** Dad sends a co-parent invite to an email address. */
export function useSendCoParentInvite() {
  return useMutation({
    mutationFn: (email: string) => postJson("/api/co-parenting/invite", { email }),
  });
}

/** Co-parent accepts an invite token after signing in. */
export function useAcceptCoParentInvite() {
  return useMutation({
    mutationFn: (token: string) => postJson("/api/co-parenting/accept", { token }),
  });
}

type AddEventInput = {
  event_date: string;
  event_type: CoParentingEventType;
  notes: string;
};

/**
 * The dad's own custody schedule and its events. Owner-side: reads and writes
 * the row where co_parenting_schedules.user_id = userId (RLS allows owner CRUD).
 */
export function useCoParentingSchedule(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["co-parenting", userId],
    queryFn: async () => {
      if (!userId) return { schedule: null as CoParentingSchedule | null, events: [] as CoParentingEvent[] };

      const { data: schedule, error } = await supabase
        .from("co_parenting_schedules")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;

      let events: CoParentingEvent[] = [];
      if (schedule) {
        const { data: ev, error: evError } = await supabase
          .from("co_parenting_events")
          .select("*")
          .eq("schedule_id", schedule.id)
          .order("event_date", { ascending: true });
        if (evError) throw evError;
        events = (ev ?? []) as CoParentingEvent[];
      }

      return { schedule: (schedule as CoParentingSchedule | null) ?? null, events };
    },
    enabled: !!userId,
  });

  /** Insert the schedule row if the dad doesn't have one yet; returns its id. */
  async function ensureScheduleId(): Promise<string> {
    if (!userId) throw new Error("Not authenticated");
    const existingId = query.data?.schedule?.id;
    if (existingId) return existingId;
    const { data, error } = await supabase
      .from("co_parenting_schedules")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  const setCustodyDates = useMutation({
    mutationFn: async (dates: string[]) => {
      if (!userId) throw new Error("Not authenticated");
      const existingId = query.data?.schedule?.id;
      if (existingId) {
        const { error } = await supabase
          .from("co_parenting_schedules")
          .update({ custody_dates: dates })
          .eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("co_parenting_schedules")
          .insert({ user_id: userId, custody_dates: dates });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["co-parenting", userId] }),
  });

  const addEvent = useMutation({
    mutationFn: async (input: AddEventInput) => {
      const scheduleId = await ensureScheduleId();
      const { error } = await supabase.from("co_parenting_events").insert({
        schedule_id: scheduleId,
        event_date: input.event_date,
        event_type: input.event_type,
        notes: input.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["co-parenting", userId] }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("co_parenting_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["co-parenting", userId] }),
  });

  return {
    schedule: query.data?.schedule ?? null,
    events: query.data?.events ?? [],
    loading: query.isLoading,
    setCustodyDates,
    addEvent,
    deleteEvent,
  };
}

/**
 * Read-only shared view for a co-parent. Finds the schedule they're linked to
 * (co_parent_user_id = userId) and returns its custody dates, events and the
 * dad's upcoming milestones. RLS guarantees no access to any other data.
 */
export function useSharedCoParentingView(userId?: string) {
  return useQuery({
    queryKey: ["co-parenting-shared", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: schedule, error } = await supabase
        .from("co_parenting_schedules")
        .select("*")
        .eq("co_parent_user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!schedule) return null;

      const today = new Date().toISOString().slice(0, 10);
      const [eventsRes, milestonesRes] = await Promise.all([
        supabase
          .from("co_parenting_events")
          .select("*")
          .eq("schedule_id", schedule.id)
          .order("event_date", { ascending: true }),
        supabase
          .from("milestones")
          .select("*")
          .eq("user_id", schedule.user_id)
          .gte("date", today)
          .order("date", { ascending: true }),
      ]);
      if (eventsRes.error) throw eventsRes.error;
      if (milestonesRes.error) throw milestonesRes.error;

      return {
        schedule: schedule as CoParentingSchedule,
        events: (eventsRes.data ?? []) as CoParentingEvent[],
        milestones: (milestonesRes.data ?? []) as Milestone[],
      };
    },
    enabled: !!userId,
  });
}

/**
 * Dad revokes co-parent access. Clears co_parent_user_id on his schedule(s) and
 * co_parent_id on his profile. Because every co-parent read policy keys off
 * co_parent_user_id, access is removed immediately and across all shared data.
 */
export function useRevokeCoParent(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { error: scheduleError } = await supabase
        .from("co_parenting_schedules")
        .update({ co_parent_user_id: null })
        .eq("user_id", userId);
      if (scheduleError) throw scheduleError;
      const { error: profileError } = await supabase
        .from("user_profile")
        .update({ co_parent_id: null })
        .eq("user_id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["co-parenting", userId] });
      queryClient.invalidateQueries({ queryKey: ["user_profile", userId] });
    },
  });
}
