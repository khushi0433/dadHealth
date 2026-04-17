import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";
import type { NotificationType } from "@/types/database";
import { buildPayload, pickJournalPrompt } from "@/lib/notifications/buildPayload";
import { sendOneSignalToExternalUserId } from "@/lib/notifications/onesignal";
import { getLocalParts, hhmmFromPgTime, isInWindow, subtractMinutes } from "@/lib/notifications/time";

type PrefRow = {
  user_id: string;
  notification_type: NotificationType;
  enabled: boolean;
  send_time: string | null;
};

function requireCronSecret(request: Request) {
  // Vercel Cron adds this header automatically (no secret support in config).
  if (request.headers.get("x-vercel-cron") === "1") return true;

  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const got = request.headers.get("x-cron-secret") || request.headers.get("cron_secret");
  if (got !== expected) return false;
  return true;
}

function ymdAddDays(ymd: string, days: number): string {
  // Interpret as UTC midnight to keep it stable.
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function ymdAddYears(ymd: string, years: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function calcScore(
  moodAvg: number | null,
  sleepAvg: number | null,
  workoutCount: number,
  journalCount: number
): number | null {
  if (moodAvg == null || sleepAvg == null) return null;
  const moodScore = Math.min(100, (moodAvg / 4) * 30);
  const sleepScore = Math.min(30, (sleepAvg / 8) * 30);
  const workoutScore = Math.min(25, workoutCount * 3);
  const journalScore = Math.min(15, journalCount * 2);
  return Math.round(Math.min(100, moodScore + sleepScore + workoutScore + journalScore));
}

async function computeWeeklyScore(admin: ReturnType<typeof createAdminSupabaseClient>, userId: string, endLocalDate: string) {
  const start = ymdAddDays(endLocalDate, -6);
  const end = endLocalDate;

  const [moodRes, sleepRes, workoutRes, journalRes] = await Promise.all([
    admin.from("mood_logs").select("mood_value").eq("user_id", userId).gte("date", start).lte("date", end),
    admin.from("sleep_logs").select("hours").eq("user_id", userId).gte("date", start).lte("date", end),
    admin
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("performed_at", `${start}T00:00:00Z`)
      .lte("performed_at", `${end}T23:59:59Z`),
    admin
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${start}T00:00:00Z`)
      .lte("created_at", `${end}T23:59:59Z`),
  ]);

  const mood = (moodRes.data ?? []).map((r: { mood_value: number }) => r.mood_value).filter((n) => Number.isFinite(n));
  const sleep = (sleepRes.data ?? []).map((r: { hours: number }) => r.hours).filter((n) => Number.isFinite(n));

  const moodAvg = mood.length ? mood.reduce((a, b) => a + b, 0) / mood.length : null;
  const sleepAvg = sleep.length ? sleep.reduce((a, b) => a + b, 0) / sleep.length : null;
  const workoutCount = workoutRes.count ?? 0;
  const journalCount = journalRes.count ?? 0;

  return calcScore(moodAvg, sleepAvg, workoutCount, journalCount);
}

export async function GET(request: Request) {
  console.log("=== /api/notifications/dispatch HIT ===");

  console.log("headers:", {
    "x-cron-secret": request.headers.get("x-cron-secret"),
    "cron_secret": request.headers.get("cron_secret"),
    "x-vercel-cron": request.headers.get("x-vercel-cron"),
    all: Object.fromEntries(request.headers.entries()),
  });
  console.log("TIME:", new Date().toISOString());
console.log("METHOD:", request.method);
console.log("URL:", request.url);
if (!requireCronSecret(request)) {
  console.log("❌ AUTH FAILED");
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

console.log("✅ AUTH PASSED");
  try {
    if (!requireCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminSupabaseClient();
    const now = new Date();

    const prefsRes = await admin
      .from("notification_preferences")
      .select("user_id, notification_type, enabled, send_time")
      .eq("enabled", true);

    if (prefsRes.error) throw prefsRes.error;
    const prefs = (prefsRes.data ?? []) as PrefRow[];

    const userIds = Array.from(new Set(prefs.map((p) => p.user_id)));
    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, skipped: 0, errors: 0 });
    }

    const profilesRes = await admin
      .from("user_profile")
      .select("user_id, timezone, push_notifications_enabled")
      .in("user_id", userIds);
    if (profilesRes.error) throw profilesRes.error;

    const pushEnabledByUser = new Map<string, boolean>(
      (profilesRes.data ?? []).map(
        (r: { user_id: string; push_notifications_enabled?: boolean | null }) => [r.user_id, Boolean(r.push_notifications_enabled)],
      ),
    );

    const tzByUser = new Map<string, string>(
      (profilesRes.data ?? []).map((r: { user_id: string; timezone?: string | null }) => [
        r.user_id,
        (r.timezone?.trim() || "UTC") as string,
      ])
    );

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    // Cache weekly challenge once per run (only used Mondays 8am local)
    let cachedChallenge: { title: string; description?: string | null } | null | undefined;

    for (const userId of userIds) {
      if (!pushEnabledByUser.get(userId)) {
        skipped += prefs.filter((p) => p.user_id === userId).length;
        continue;
      }

      const timeZone = tzByUser.get(userId) ?? "UTC";
      const { localDate, localDow, localHHMM } = getLocalParts(now, timeZone);

      const userPrefs = prefs.filter((p) => p.user_id === userId);

      // Optional lookups (only when needed)
      let hasCheckinToday: boolean | null = null;
      let streakDays: number | null = null;
      let milestoneText: string | null = null;
      let weeklyScore: number | null = null;

      for (const pref of userPrefs) {
        const type = pref.notification_type;

        let due = false;
        let journalPrompt: string | null = null;

        if (type === "morning_checkin") {
          due = isInWindow(localHHMM, "07:30");
        } else if (type === "weekly_score") {
          due = localDow === 0 && isInWindow(localHHMM, "18:00");
        } else if (type === "weekly_challenge") {
          due = localDow === 1 && isInWindow(localHHMM, "08:00");
        } else if (type === "streak_at_risk") {
          due = isInWindow(localHHMM, "21:00");
          if (due) {
            if (hasCheckinToday == null) {
              const checkRes = await admin
                .from("mood_logs")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("date", localDate);
              hasCheckinToday = (checkRes.count ?? 0) > 0;
            }
            due = !hasCheckinToday;
          }
        } else if (type === "bedtime_story") {
          if (pref.send_time) {
            const bedtime = hhmmFromPgTime(pref.send_time);
            const reminder = subtractMinutes(bedtime, 30);
            due = isInWindow(localHHMM, reminder);
          }
        } else if (type === "workout_window") {
          if (pref.send_time) {
            due = isInWindow(localHHMM, hhmmFromPgTime(pref.send_time));
          }
        } else if (type === "journal_prompt") {
          if (pref.send_time) {
            due = isInWindow(localHHMM, hhmmFromPgTime(pref.send_time));
          }
          if (due) journalPrompt = pickJournalPrompt(localDate);
        } else if (type === "milestone_anniversary") {
          // Run daily at 08:00 local; send only if there is a milestone exactly 1 year ago.
          due = isInWindow(localHHMM, "08:00");
          if (due) {
            const oneYearAgo = ymdAddYears(localDate, -1);
            const mRes = await admin
              .from("milestones")
              .select("text")
              .eq("user_id", userId)
              .eq("date", oneYearAgo)
              .maybeSingle();
            milestoneText = (mRes.data as { text?: string } | null)?.text ?? null;
            due = Boolean(milestoneText);
          }
        }

        if (!due) continue;

        // Server-side cap + per-type daily suppression
        const logRes = await admin.rpc("log_notification_if_allowed", {
          p_user_id: userId,
          p_type: type,
          p_timezone: timeZone,
        });
        if (logRes.error) {
          errors++;
          continue;
        }
        // TEMP proof test: bypass daily cap / per-type suppression (revert before production traffic)
        // if (logRes.data !== true) {
        //   skipped++;
        //   continue;
        // }

        // Dynamic payload pieces (fetched only when we know we're sending)
        let weeklyChallenge: { title: string; description?: string | null } | null = null;

        if (type === "weekly_challenge") {
          if (cachedChallenge === undefined) {
            const cRes = await admin
              .from("weekly_challenges")
              .select("title, description")
              .eq("active", true)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            cachedChallenge = (cRes.data as { title: string; description?: string | null } | null) ?? null;
          }
          weeklyChallenge = cachedChallenge ?? null;
        }

        if (type === "weekly_score") {
          weeklyScore = await computeWeeklyScore(admin, userId, localDate);
        }

        if (type === "streak_at_risk") {
          const sRes = await admin.from("user_streaks").select("streak_count").eq("user_id", userId).maybeSingle();
          streakDays = (sRes.data as { streak_count?: number } | null)?.streak_count ?? null;
        }

        const payload = buildPayload({
          type,
          weeklyScore,
          streakDays,
          weeklyChallenge,
          milestoneText,
          journalPrompt,
        });

        try {
          await sendOneSignalToExternalUserId({ externalUserId: userId, payload });
          sent++;
        } catch (e) {
          console.error("[notifications/dispatch] OneSignal send failed", { userId, type, e });
          errors++;
        }
      }
    }

    return NextResponse.json({ ok: true, sent, skipped, errors });
  } catch (e) {
    console.error("[notifications/dispatch]", e);
    return NextResponse.json({ error: "Dispatch failed" }, { status: 500 });
  }
}