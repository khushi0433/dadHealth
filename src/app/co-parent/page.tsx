"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCoParentingSchedule,
  useRevokeCoParent,
  useSendCoParentInvite,
  useSharedCoParentingView,
} from "@/hooks/useCoParenting";
import type { CoParentingEvent, CoParentingEventType, Milestone } from "@/types/database";
import { toast } from "@/hooks/use-toast";

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

const EVENT_TYPES: { value: Exclude<CoParentingEventType, "custody">; label: string }[] = [
  { value: "handover", label: "Handover" },
  { value: "school", label: "School event" },
];

const PRIVACY_NOTE =
  "You have a read-only view of the shared calendar. Mood, sleep, journal, Dad Health Score and community activity are never shared.";

function EventList({ events }: { events: CoParentingEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">No events yet.</p>;
  return (
    <div className="divide-y divide-border">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-start gap-3 py-3">
          <span className="tag-pill shrink-0">{format(parseISO(ev.event_date), "d MMM")}</span>
          <div className="flex-1 min-w-0">
            <span className="tag-pill-dark inline-block capitalize">{ev.event_type}</span>
            {ev.notes && <p className="text-sm text-foreground/70 leading-relaxed mt-1">{ev.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Read-only view shown to a connected co-parent. */
function SharedCalendarView({
  custodyDates,
  events,
  milestones,
}: {
  custodyDates: Date[];
  events: CoParentingEvent[];
  milestones: Milestone[];
}) {
  return (
    <SitePageShell>
      <section className="bg-background border-b border-border">
        <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 py-10">
          <span className="section-label !p-0 mb-4 block">CO-PARENTING</span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Shared custody calendar</h1>
          <p className="text-sm text-muted-foreground mt-2">{PRIVACY_NOTE}</p>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 py-10">
        <div className="min-w-0">
          <span className="section-label !p-0 mb-4 block">CUSTODY DAYS</span>
          <div className="rounded-lg border border-border bg-card inline-block">
            {/* No onSelect → read-only. */}
            <Calendar mode="multiple" selected={custodyDates} />
          </div>

          <div className="mt-8">
            <span className="section-label !p-0 mb-4 block">UPCOMING MILESTONES</span>
            {milestones.length > 0 ? (
              <div className="divide-y divide-border">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 py-3">
                    <span className="tag-pill shrink-0">{format(parseISO(m.date), "d MMM")}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/70 leading-relaxed">{m.text}</p>
                      {m.tag && <span className="tag-pill-dark inline-block mt-1">{m.tag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming milestones.</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <span className="section-label !p-0 mb-4 block">HANDOVER & SCHOOL EVENTS</span>
          <EventList events={events} />
        </div>
      </div>

      <SiteFooter />
    </SitePageShell>
  );
}

export default function CoParentingPage() {
  const { user, openAuthModal } = useAuth();
  const { schedule, events, loading, setCustodyDates, addEvent, deleteEvent } =
    useCoParentingSchedule(user?.id);
  const shared = useSharedCoParentingView(user?.id);
  const sendInvite = useSendCoParentInvite();
  const revoke = useRevokeCoParent(user?.id);

  const [inviteEmail, setInviteEmail] = useState("");
  const [eventDate, setEventDate] = useState(() => toDateStr(new Date()));
  const [eventType, setEventType] = useState<CoParentingEventType>("handover");
  const [eventNotes, setEventNotes] = useState("");

  const custodyDates = useMemo(
    () => (schedule?.custody_dates ?? []).map((d) => parseISO(d)),
    [schedule?.custody_dates]
  );
  const sharedCustodyDates = useMemo(
    () => (shared.data?.schedule.custody_dates ?? []).map((d) => parseISO(d)),
    [shared.data?.schedule.custody_dates]
  );
  const coParentConnected = Boolean(schedule?.co_parent_user_id);

  const handleSelectDays = (days: Date[] | undefined) => {
    const next = (days ?? []).map(toDateStr).sort();
    setCustodyDates.mutate(next, {
      onError: () => toast({ description: "Unable to save custody days.", variant: "destructive" }),
    });
  };

  const handleSendInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    try {
      await sendInvite.mutateAsync(inviteEmail.trim());
      setInviteEmail("");
      toast({ description: "Invite sent." });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unable to send invite.",
        variant: "destructive",
      });
    }
  };

  const handleAddEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    try {
      await addEvent.mutateAsync({ event_date: eventDate, event_type: eventType, notes: eventNotes });
      setEventNotes("");
      toast({ description: "Event added." });
    } catch {
      toast({ description: "Unable to add event.", variant: "destructive" });
    }
  };

  const handleRevoke = async () => {
    try {
      await revoke.mutateAsync();
      toast({ description: "Co-parent access revoked." });
    } catch {
      toast({ description: "Unable to revoke access.", variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <SitePageShell>
        <section className="w-full max-w-md mx-auto px-5 py-16">
          <span className="section-label !p-0 mb-4 block">CO-PARENTING</span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight mb-4">Shared custody calendar</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to set up a shared calendar and invite a co-parent.
          </p>
          <LimeButton onClick={openAuthModal}>Sign in</LimeButton>
        </section>
        <SiteFooter />
      </SitePageShell>
    );
  }

  // A co-parent (linked to someone else's schedule, owns none of their own)
  // gets the read-only shared view.
  if (!loading && !shared.isLoading && !schedule && shared.data) {
    return (
      <SharedCalendarView
        custodyDates={sharedCustodyDates}
        events={shared.data.events}
        milestones={shared.data.milestones}
      />
    );
  }

  return (
    <SitePageShell>
      <section className="bg-background border-b border-border">
        <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 py-10">
          <span className="section-label !p-0 mb-4 block">CO-PARENTING</span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Shared custody calendar</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Mark your custody days and add handover or school events. A co-parent you invite gets a
            read-only view — they never see your mood, journal, score or community activity.
          </p>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 py-10">
        {/* Custody calendar */}
        <div className="min-w-0">
          <span className="section-label !p-0 mb-4 block">CUSTODY DAYS</span>
          <p className="text-xs text-muted-foreground mb-3">
            Tap days to mark or unmark them. Highlighted days are your custody days.
          </p>
          <div className="rounded-lg border border-border bg-card inline-block">
            <Calendar mode="multiple" selected={custodyDates} onSelect={handleSelectDays} />
          </div>

          {/* Invite / connection status */}
          <div className="mt-8">
            <span className="section-label !p-0 mb-4 block">CO-PARENT</span>
            {coParentConnected ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
                <p className="text-sm">A co-parent is connected with read-only access.</p>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={revoke.isPending}
                  className="mt-3 inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold uppercase text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {revoke.isPending ? "Revoking…" : "Revoke access"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="rounded-lg border border-border bg-card p-4">
                <label className="text-xs font-heading font-bold tracking-wider uppercase text-muted-foreground block mb-1.5">
                  Invite co-parent by email
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="co-parent@example.com"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <LimeButton type="submit" disabled={sendInvite.isPending}>
                    {sendInvite.isPending ? "Sending…" : "Send invite"}
                  </LimeButton>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Events */}
        <div className="min-w-0">
          <span className="section-label !p-0 mb-4 block">HANDOVER & SCHOOL EVENTS</span>

          <form onSubmit={handleAddEvent} className="rounded-lg border border-border bg-card p-4 mb-6">
            <div className="grid gap-3">
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CoParentingEventType)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                rows={2}
                placeholder="Notes (e.g. handover at 6pm at the station) — visible to both parents"
                className="min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <LimeButton type="submit" disabled={addEvent.isPending}>
                {addEvent.isPending ? "Adding…" : "Add event"}
              </LimeButton>
            </div>
          </form>

          {events.length > 0 ? (
            <div className="divide-y divide-border">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-3">
                  <span className="tag-pill shrink-0">{format(parseISO(ev.event_date), "d MMM")}</span>
                  <div className="flex-1 min-w-0">
                    <span className="tag-pill-dark inline-block capitalize">{ev.event_type}</span>
                    {ev.notes && <p className="text-sm text-foreground/70 leading-relaxed mt-1">{ev.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEvent.mutate(ev.id)}
                    disabled={deleteEvent.isPending}
                    className="shrink-0 inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          )}
        </div>
      </div>

      <SiteFooter />
    </SitePageShell>
  );
}
