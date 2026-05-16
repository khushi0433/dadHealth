"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { format } from "date-fns";
import { Camera, ImagePlus, Lock, Trash2, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import CookTogetherRecipes from "@/components/CookTogetherRecipes";
import DadDaysSearch from "@/components/DadDaysSearch";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import { useProStatus } from "@/components/ProProvider";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/contexts/AuthContext";
import { useBond } from "@/hooks/useBond";
import LimeButton from "@/components/LimeButton";
import { trackEvent } from "@/lib/analytics";
import { useUpdateProfile, useUserProfile } from "@/hooks/useUserProfile";
import type { DadDaysBudget, DadDaysChildAge, DadDaysSearchResult } from "@/types/dadDays";
import { supabase } from "@/utils/supabaseClient";
import PromptModal from "@/components/PromptModal";
import { toast } from "@/hooks/use-toast";
import {
  MILESTONE_PHOTO_CLIENT_MAX_EDGE,
  MILESTONE_PHOTO_CLIENT_MAX_MB,
  MILESTONE_STORAGE_LIMIT_BYTES,
  MILESTONE_STORAGE_WARN_BYTES,
} from "@/lib/milestonePhotos";




type DadDateRow = {
  icon?: string;
  name: string;
  age_range?: string;
  age?: string;
  budget?: string;
  duration_minutes?: number;
  time_of_day?: string;
};

type DadDateDisplay = DadDateRow & { time: string };

type MilestoneRow = {
  id: string;
  date: string;
  text: string;
  tag: string;
  photo_url?: string | null;
};

function formatStorage(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10}MB`;
}

const BondPage = () => {
  const { user } = useAuth();
  const { isPro, showPaywall } = useProStatus();
  const {
    dadDates,
    milestones,
    prompts,
    milestoneStorageBytes,
    saveMilestone,
    uploadMilestonePhoto,
    deleteMilestonePhoto,
  } = useBond(user?.id);

  const [presentMode, setPresentMode] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [milestoneDate, setMilestoneDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [milestoneText, setMilestoneText] = useState("");
  const [milestoneTag, setMilestoneTag] = useState("moment");
  const [formPhoto, setFormPhoto] = useState<File | null>(null);
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoUploadTarget, setPhotoUploadTarget] = useState<string | null>(null);
  const [storageWarningShown, setStorageWarningShown] = useState(false);
  const formPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const cardPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const dates: DadDateDisplay[] = (dadDates as DadDateRow[]).map((d) => ({
    ...d,
    time: d.time_of_day ?? (d.duration_minutes != null
      ? (d.duration_minutes >= 60 ? `${Math.floor(d.duration_minutes / 60)} hr` : `${d.duration_minutes} min`)
      : "—"),
  }));
  const filters = useMemo(() => {
    const options: Array<{ id: string; label: string }> = [{ id: "all", label: "All" }];
    if (dates.some((d) => d.budget?.toLowerCase() === "free")) {
      options.push({ id: "free", label: "Free" });
    }
    if (dates.some((d) => d.budget?.includes("£") && Number.parseInt(d.budget, 10) <= 15)) {
      options.push({ id: "under-15", label: "Under £15" });
    }
    if (dates.some((d) => d.duration_minutes != null && d.duration_minutes >= 60) || dates.some((d) => d.time.includes("hr"))) {
      options.push({ id: "one-hour", label: "1 hr" });
    }
    if (
      dates.some((d) => d.time_of_day?.toLowerCase().includes("evening")) ||
      dates.some((d) => d.time.toLowerCase().includes("evening"))
    ) {
      options.push({ id: "evening", label: "Evening" });
    }
    return options;
  }, [dates]);
  const filteredDates = dates.filter((d) => {
    if (dateFilter === "all") return true;
    if (dateFilter === "free") return d.budget?.toLowerCase() === "free";
    if (dateFilter === "under-15") return d.budget?.includes("£") && Number.parseInt(d.budget, 10) <= 15;
    if (dateFilter === "one-hour") return d.time?.includes("1 hr");
    if (dateFilter === "evening") return d.time?.toLowerCase().includes("evening");
    return true;
  });

  const displayMilestones = milestones as MilestoneRow[];
  const conversationStarters = prompts.map((p: { prompt: string }) => p.prompt);
  const storageNearLimit = milestoneStorageBytes >= MILESTONE_STORAGE_WARN_BYTES;

  useEffect(() => {
    if (!formPhoto) {
      setFormPhotoPreview(null);
      return;
    }

    const nextUrl = URL.createObjectURL(formPhoto);
    setFormPhotoPreview(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [formPhoto]);

  useEffect(() => {
    if (!isPro || storageWarningShown || !storageNearLimit) return;
    setStorageWarningShown(true);
    toast({
      description: `Milestone photos are using ${formatStorage(milestoneStorageBytes)} of ${formatStorage(MILESTONE_STORAGE_LIMIT_BYTES)}.`,
    });
  }, [isPro, milestoneStorageBytes, storageNearLimit, storageWarningShown]);

  const handlePresentModeToggle = () => {
    const nextValue = !presentMode;
    setPresentMode(nextValue);
    trackEvent("present_dad_mode_toggled", {
      enabled: nextValue,
    });
  };

  const compressPhoto = async (file: File) => {
    return imageCompression(file, {
      maxSizeMB: MILESTONE_PHOTO_CLIENT_MAX_MB,
      maxWidthOrHeight: MILESTONE_PHOTO_CLIENT_MAX_EDGE,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
  };

  const handleFormPhotoSelected = async (file: File | null) => {
    if (!file) return;
    if (!isPro) {
      showPaywall("Milestone photo uploads");
      return;
    }

    try {
      setFormPhoto(await compressPhoto(file));
    } catch {
      toast({ description: "Unable to prepare that photo. Try another image.", variant: "destructive" });
    }
  };

  const handleCardPhotoSelected = async (file: File | null) => {
    if (!file || !photoUploadTarget) return;
    if (!isPro) {
      showPaywall("Milestone photo uploads");
      return;
    }

    try {
      const compressed = await compressPhoto(file);
      await uploadMilestonePhoto.mutateAsync({ milestoneId: photoUploadTarget, file: compressed });
      toast({ description: "Milestone photo saved." });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unable to upload milestone photo.",
        variant: "destructive",
      });
    } finally {
      setPhotoUploadTarget(null);
      if (cardPhotoInputRef.current) cardPhotoInputRef.current.value = "";
    }
  };

  const handleSaveMilestone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const text = milestoneText.trim();
    const tag = milestoneTag.trim() || "moment";
    if (!text) {
      toast({ description: "Add a short milestone note first.", variant: "destructive" });
      return;
    }

    try {
      const saved = await saveMilestone.mutateAsync({
        date: milestoneDate,
        text,
        tag,
      });

      if (formPhoto) {
        await uploadMilestonePhoto.mutateAsync({ milestoneId: saved.id, file: formPhoto });
      }

      setMilestoneText("");
      setMilestoneTag("moment");
      setFormPhoto(null);
      if (formPhotoInputRef.current) formPhotoInputRef.current.value = "";
      toast({ description: "Milestone saved." });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unable to save milestone.",
        variant: "destructive",
      });
    }
  };

  const openCardPhotoPicker = (milestoneId: string) => {
    if (!isPro) {
      showPaywall("Milestone photo uploads");
      return;
    }
    setPhotoUploadTarget(milestoneId);
    cardPhotoInputRef.current?.click();
  };

  return (
    <SitePageShell>
      {/* Hero */}
      <section className="relative w-full min-w-0 h-[320px] lg:h-[400px]">
      <img
  src={IMAGES.bond}
  alt="Parenting"
  className="absolute inset-0 w-full h-full object-cover object-[50%_35%]"
/>
        <div className="absolute inset-0 bg-background/65" />
        <div className="relative z-10 flex flex-col justify-center items-start h-full w-full max-w-[1400px] mx-auto px-5 lg:px-8 min-w-0">
          <span className="section-label text-primary mb-2">THE BOND</span>
          <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide">
            PARENTING
          </h1>
          <p className="text-sm text-foreground/60 mt-2 max-w-md">
            Built for dads, by dads. Kill the old version of you.
          </p>
        </div>
      </section>

      {/* Present Dad Mode */}
      <section className="bg-primary/[0.06] border-y border-primary/20">
        <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between min-w-0">
          <div>
            <h3 className="font-heading text-sm font-extrabold text-foreground uppercase tracking-wide">Present Dad Mode</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Block distractions for 60 minutes</p>
          </div>
          <button
            onClick={handlePresentModeToggle}
            className="w-11 h-6 rounded-full bg-muted relative cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${
                presentMode ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 min-w-0">
        {/* Find Dad Days Near You */}
        <DadDaysSearch userId={user?.id} onResultsSaved={() => setRefreshKey((prev) => prev + 1)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14 lg:items-start">
          {/* Dad date ideas */}
          <div className="pt-8 pb-6 lg:col-span-7 lg:pb-10 min-w-0">
            <span className="section-label !p-0 mb-4 block">SAVED IDEAS</span>
            <div className="flex gap-2 mb-4 flex-wrap">
              {filters.map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setDateFilter(filterOption.id)}
                  className={`px-3 py-1.5 border font-heading text-[11px] font-bold tracking-wide uppercase cursor-pointer transition-all ${
                    dateFilter === filterOption.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
              {filteredDates.length > 0 ? filteredDates.map((d) => (
                <div
                  key={d.name}
                  onClick={() =>
                    trackEvent("dad_date_clicked", {
                      name: d.name,
                      age_range: d.age_range ?? d.age ?? null,
                      budget: d.budget ?? null,
                    })
                  }
                  className="border border-border p-3.5 cursor-pointer transition-all hover:border-primary group min-w-0"
                >
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <div className="font-heading text-[13px] font-extrabold text-foreground tracking-wide mb-1 group-hover:text-primary transition-colors">
                    {d.name}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Age {d.age_range ?? d.age ?? "—"}</span>
                    <span className="text-[10px] text-primary">· {d.budget ?? "—"}</span>
                    <span className="text-[10px] text-muted-foreground">· {d.time ?? "—"}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground col-span-full">No dad date ideas yet.</p>
              )}
            </div>
          </div>

          {/* Milestones - Pro gated */}
          <div className="py-8 border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:pl-10 xl:pl-14 lg:col-span-5 lg:pt-10 min-w-0">
            <span className="section-label !p-0 mb-12 block">MILESTONE TRACKER</span>
            {isPro ? (
              <div className="w-full">
                <form onSubmit={handleSaveMilestone} className="rounded-lg border border-border bg-card p-4 mb-5">
                  <div className="grid gap-3">
                    <input
                      type="date"
                      value={milestoneDate}
                      onChange={(event) => setMilestoneDate(event.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    />
                    <textarea
                      value={milestoneText}
                      onChange={(event) => setMilestoneText(event.target.value)}
                      rows={3}
                      placeholder="First bike ride, school play, big laugh..."
                      className="min-h-[86px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                    <input
                      type="text"
                      value={milestoneTag}
                      onChange={(event) => setMilestoneTag(event.target.value)}
                      placeholder="tag"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  {formPhotoPreview && (
                    <div className="mt-3 relative overflow-hidden rounded-lg border border-border bg-background">
                      <img src={formPhotoPreview} alt="Selected milestone" className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormPhoto(null);
                          if (formPhotoInputRef.current) formPhotoInputRef.current.value = "";
                        }}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground hover:bg-background"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Remove selected photo</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => formPhotoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-accent hover:text-accent-foreground"
                    >
                      <ImagePlus className="h-4 w-4" aria-hidden="true" />
                      {formPhoto ? "Change photo" : "Add photo"}
                    </button>
                    <LimeButton type="submit" disabled={saveMilestone.isPending || uploadMilestonePhoto.isPending}>
                      {saveMilestone.isPending || uploadMilestonePhoto.isPending ? "SAVING..." : "SAVE MILESTONE ->"}
                    </LimeButton>
                  </div>
                  <input
                    ref={formPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void handleFormPhotoSelected(event.target.files?.[0] ?? null)}
                  />
                </form>

                {storageNearLimit && (
                  <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
                    Photo storage: {formatStorage(milestoneStorageBytes)} of {formatStorage(MILESTONE_STORAGE_LIMIT_BYTES)}.
                  </div>
                )}

                <input
                  ref={cardPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handleCardPhotoSelected(event.target.files?.[0] ?? null)}
                />
                {displayMilestones.length > 0 ? displayMilestones.map((m) => (
                  <div key={m.id} className="flex gap-3 items-start py-3 border-b border-border last:border-b-0">
                    <span className="tag-pill shrink-0">{m.date ? format(new Date(m.date), "d MMM") : "—"}</span>
                    <div className="flex-1 min-w-0">
                      {m.photo_url && (
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(m.photo_url ?? null)}
                          className="mb-3 block w-full overflow-hidden rounded-lg border border-border bg-background"
                        >
                          <img src={m.photo_url} alt={m.text} className="h-32 w-full object-cover transition-transform hover:scale-[1.02]" />
                        </button>
                      )}
                      <p className="text-sm text-foreground/70 leading-relaxed">{m.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="tag-pill-dark inline-block">{m.tag}</span>
                        <button
                          type="button"
                          onClick={() => openCardPhotoPicker(m.id)}
                          disabled={uploadMilestonePhoto.isPending}
                          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                          {m.photo_url ? "Replace" : "Photo"}
                        </button>
                        {m.photo_url && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteMilestonePhoto.mutateAsync(m.id);
                                toast({ description: "Milestone photo removed." });
                              } catch (error) {
                                toast({
                                  description: error instanceof Error ? error.message : "Unable to remove milestone photo.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={deleteMilestonePhoto.isPending}
                            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No milestones yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 lg:p-8 bg-background/50 border border-border rounded-lg text-center gap-2 w-full">
                <div className="relative">
                  <Lock className="h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <Camera className="absolute -right-2 -bottom-1 h-5 w-5 rounded-full bg-background text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-foreground">Pro Feature</p>
                <p className="text-[10px] text-muted-foreground max-w-sm">Words are good. Photos last forever.</p>
                <button
                  type="button"
                  onClick={() => showPaywall("Milestone photo uploads")}
                  className="px-3 py-1 text-[10px] bg-primary text-primary-foreground font-bold uppercase rounded cursor-pointer hover:brightness-110"
                >
                  Unlock →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conversation starters */}
        <div className="py-8 border-t border-border w-full">
          <span className="section-label !p-0 mb-4 block">CONVERSATION STARTERS</span>
          {conversationStarters.length > 0 ? conversationStarters.map((q: string) => (
            <div
              key={q}
              className="py-3 border-b border-border last:border-b-0 pl-3 border-l-[3px] border-l-primary mb-2"
            >
              <p className="text-sm text-foreground/70 leading-relaxed italic">"{q}"</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No conversation starters yet.</p>
          )}
        </div>

        <CookTogetherRecipes />
      </div>

      <SiteFooter />
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close photo</span>
          </button>
          <img
            src={selectedPhoto}
            alt="Milestone"
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </SitePageShell>
  );
};


export default BondPage;

