"use client";

import SitePageShell from "@/components/SitePageShell";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";
import { useNotificationPreferences, useUpsertNotificationPreference } from "@/hooks/useNotificationPreferences";
import type { NotificationType } from "@/types/database";
import { Switch } from "@/components/ui/switch";
import { requestOneSignalPermission } from "@/components/OneSignalManager";
import { toast } from "@/hooks/use-toast";

const TYPES: Array<{
  type: NotificationType;
  title: string;
  description: string;
  linkLabel: string;
  needsTime?: boolean;
  timeHint?: string;
}> = [
  {
    type: "morning_checkin",
    title: "Morning check-in",
    description: "7:30am daily — Good morning. How are you feeling today?",
    linkLabel: "Home",
  },
  {
    type: "bedtime_story",
    title: "Bedtime story reminder",
    description: "30 mins before your set bedtime — Bedtime in 30 mins. Story time?",
    linkLabel: "Bond",
    needsTime: true,
    timeHint: "Bedtime (local time)",
  },
  {
    type: "workout_window",
    title: "Workout window",
    description: "At your set time — Your workout window is now. 20 mins is enough.",
    linkLabel: "Fitness",
    needsTime: true,
    timeHint: "Workout time (local time)",
  },
  {
    type: "weekly_score",
    title: "Weekly score",
    description: "Sunday 6pm — Your Dad Health Score this week: [score]",
    linkLabel: "Progress",
  },
  {
    type: "streak_at_risk",
    title: "Streak at risk",
    description: "9pm if you haven’t checked in — Your [n]-day streak ends at midnight.",
    linkLabel: "Home",
  },
  {
    type: "weekly_challenge",
    title: "Weekly challenge",
    description: "Monday 8am — Weekly challenge title + description",
    linkLabel: "Home",
  },
  {
    type: "journal_prompt",
    title: "Journal prompt",
    description: "At your set evening time — rotating prompt",
    linkLabel: "Mind",
    needsTime: true,
    timeHint: "Evening time (local time)",
  },
  {
    type: "milestone_anniversary",
    title: "Milestone anniversary",
    description: "Date-matched — One year ago: [milestone text]",
    linkLabel: "Bond",
  },
];

function toHHMM(pgTime: string | null | undefined): string {
  if (!pgTime) return "";
  const m = /^(\d{2}):(\d{2})/.exec(pgTime);
  return m ? `${m[1]}:${m[2]}` : "";
}

function toPgTime(hhmm: string): string | null {
  if (!hhmm) return null;
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return `${m[1]}:${m[2]}:00`;
}

export default function SettingsPage() {
  const { user, openAuthModal } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const updateProfile = useUpdateProfile(user?.id);

  const { data: prefs = [], error: prefsError } = useNotificationPreferences(user?.id);
  const upsertPref = useUpsertNotificationPreference(user?.id);

  const pushEnabled = Boolean(profile?.push_notifications_enabled);
  const timezone = profile?.timezone?.trim() || "";

  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const canEditPrefCards = Boolean(user) && !prefsError;

  const logError = (label: string, error: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(label, error);
    }
  };

  const handleMasterToggle = async (next: boolean) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await updateProfile.mutateAsync({
        push_notifications_enabled: next,
        timezone: timezone || browserTz,
      });
      if (next) {
        requestOneSignalPermission();
        toast({ description: "Push notifications enabled. Confirm the browser prompt to opt in." });
      } else {
        toast({ description: "Push notifications disabled." });
      }
    } catch (e) {
      logError("[settings] updateProfile failed", e);
      toast({ description: "Unable to save settings right now. Please try again.", variant: "destructive" });
    }
  };

  const handleTypeToggle = async (type: NotificationType, enabled: boolean) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const existing = prefs.find((p) => p.notification_type === type) || null;
      const needsTime = TYPES.find((t) => t.type === type)?.needsTime;
      const defaultTimeByType: Partial<Record<NotificationType, string>> = {
        bedtime_story: "20:00:00",
        workout_window: "12:00:00",
        journal_prompt: "20:30:00",
      };
      const send_time =
        enabled && needsTime && !existing?.send_time
          ? (defaultTimeByType[type] ?? null)
          : (existing?.send_time ?? null);
      await upsertPref.mutateAsync({
        notification_type: type,
        enabled,
        send_time,
      });
    } catch (e) {
      logError("[settings] upsertPref failed", e);
      toast({ description: "Unable to update notification right now. Please try again.", variant: "destructive" });
    }
  };

  const handleTimeChange = async (type: NotificationType, hhmm: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const existing = prefs.find((p) => p.notification_type === type) || null;
      await upsertPref.mutateAsync({
        notification_type: type,
        enabled: existing?.enabled ?? true,
        send_time: toPgTime(hhmm),
      });
    } catch (e) {
      logError("[settings] upsertPref time failed", e);
      toast({ description: "Unable to save time right now. Please try again.", variant: "destructive" });
    }
  };

  const handleTimezoneSave = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await updateProfile.mutateAsync({ timezone: browserTz });
      toast({ description: `Timezone saved: ${browserTz}` });
    } catch (e) {
      logError("[settings] timezone save failed", e);
      toast({ description: "Unable to save timezone right now. Please try again.", variant: "destructive" });
    }
  };

  return (
    <SitePageShell>
      <section className="bg-background border-b border-border">
        <div className="w-full px-5 lg:px-8 py-10">
          <span className="section-label !p-0 mb-4 block">SETTINGS</span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Push notifications</h1>
          <p className="text-sm text-muted-foreground mt-2">
            All notifications are opt-in. Times are based on your dad timezone.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:items-stretch">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
              <div className="min-w-0">
                <div className="font-heading font-bold">Enable push notifications</div>
                <div className="text-xs text-muted-foreground">
                  Required for all notification types.
                </div>
              </div>
              <Switch checked={pushEnabled} disabled={!user} onCheckedChange={handleMasterToggle} />
            </div>

            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-heading font-bold">Timezone</div>
                  <div className="text-xs text-muted-foreground">
                    Stored in <code className="text-xs">user_profile.timezone</code>. Current:{" "}
                    <span className="font-mono">{timezone || "—"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTimezoneSave}
                  disabled={!user}
                  className="shrink-0 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  Use browser timezone
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            {prefsError && (
              <div className="lg:col-span-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Notification preferences are temporarily unavailable. Please refresh and try again.
              </div>
            )}
            {TYPES.map((t) => {
              const row = prefs.find((p) => p.notification_type === t.type) || null;
              const enabled = Boolean(row?.enabled);
              const hhmm = toHHMM(row?.send_time);
              const disabled = !canEditPrefCards || !pushEnabled;

              return (
                <div key={t.type} className="rounded-lg border border-border bg-card px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-heading font-bold">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Opens: <span className="font-semibold">{t.linkLabel}</span>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      disabled={disabled}
                      onCheckedChange={(v) => handleTypeToggle(t.type, v)}
                    />
                  </div>

                  {t.needsTime && (
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">{t.timeHint}</div>
                      <input
                        type="time"
                        value={hhmm}
                        disabled={disabled}
                        onChange={(e) => handleTimeChange(t.type, e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm font-mono"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!user && (
            <div className="mt-6 text-sm text-muted-foreground">
              Sign in to edit settings.
            </div>
          )}
        </div>
      </section>
    </SitePageShell>
  );
}

