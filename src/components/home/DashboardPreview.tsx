"use client";

import { useEffect, useState } from "react";
import { BLOCKED_CHECKIN_MOODS, DAYS } from "@/lib/constants";
import { useDashboard } from "@/hooks/useDashboard";
import { useCommunity } from "@/hooks/useCommunity";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./dashboardPreview/Sidebar";
import HomeScreen from "./dashboardPreview/HomeScreen";
import FitnessScreen from "./dashboardPreview/FitnessScreen";
import MindScreen from "./dashboardPreview/MindScreen";
import BondScreen from "./dashboardPreview/BondScreen";
import CommunityScreen from "./dashboardPreview/CommunityScreen";
import ProgressScreen from "./dashboardPreview/ProgressScreen";
import { useDashboardPreviewData } from "./dashboardPreview/useDashboardPreviewData";
import type { DashboardGoal, DashboardScreen } from "./dashboardPreview/types";

const SIDEBAR_ITEMS = [
  { iconKey: "home", label: "HOME", id: "HOME" as DashboardScreen },
  { iconKey: "fitness", label: "FITNESS", id: "FITNESS" as DashboardScreen },
  { iconKey: "mind", label: "MIND", id: "MIND" as DashboardScreen },
  { iconKey: "bond", label: "BOND", id: "BOND" as DashboardScreen },
  { iconKey: "community", label: "COMMUNITY", id: "COMMUNITY" as DashboardScreen },
  { iconKey: "progress", label: "PROGRESS", id: "PROGRESS" as DashboardScreen },
  { iconKey: "pro", label: "PRO ★", href: "/pricing" },
];

const DEFAULT_GOALS = [
  { iconKey: "breathing", name: "5-min breathing reset", time: "MORNING · MENTAL HEALTH", status: "done" as DashboardGoal["status"] },
  { iconKey: "run", name: "20-min dad run", time: "12:30PM · FITNESS", status: "start" as DashboardGoal["status"] },
  { iconKey: "story", name: "Bedtime story", time: "7:30PM · PARENTING", status: "log" as DashboardGoal["status"] },
  { iconKey: "journal", name: "Evening journal", time: "9:00PM · REFLECTION", status: "open" as DashboardGoal["status"] },
];

type DashboardPreviewProps = {
  variant?: "preview" | "full";
};

const DashboardPreview = ({ variant = "preview" }: DashboardPreviewProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { data: dashboard, dadsCount, checkIn } = useDashboard(user?.id);
  const { posts: communityPosts = [], loading: communityLoading } = useCommunity(user?.id);
  const [activeScreen, setActiveScreen] = useState<DashboardScreen>("HOME");
  const isFullDashboard = variant === "full";
  const [selectedMood, setSelectedMood] = useState((dashboard?.mood_value as number | undefined) ?? 3);
  const [selectedSleep, setSelectedSleep] = useState((dashboard?.sleep_hours as number | undefined) ?? 7);
  const [dailyGoals, setDailyGoals] = useState<DashboardGoal[]>(DEFAULT_GOALS);

  const {
    hasUser,
    now,
    hasCheckedInToday,
    score,
    scoreItems,
    streak,
    moodWeek,
    moodSummary,
    greetingName,
    displayNameShort,
    monthWorkouts,
    dates,
    reminders,
    circles,
    milestones,
    bodyWeekSeries,
    displayPosts,
    reportStatsList,
    featuredWorkoutTitle,
    featuredWorkoutMeta,
  } = useDashboardPreviewData({
    dashboard: (dashboard as Record<string, unknown> | null | undefined),
    profile,
    user,
    communityPosts: communityPosts as Record<string, unknown>[],
  });

  useEffect(() => {
    if (!dashboard) return;
    if (dashboard.mood_value != null) setSelectedMood(dashboard.mood_value);
    if (dashboard.sleep_hours != null) setSelectedSleep(dashboard.sleep_hours);
  }, [dashboard]);

  const isCheckinBlocked = BLOCKED_CHECKIN_MOODS.includes(selectedMood as (typeof BLOCKED_CHECKIN_MOODS)[number]);

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  const handleDailyCheckIn = () => {
    if (isCheckinBlocked) {
      return;
    }
    checkIn.mutate({ mood_value: selectedMood, sleep_hours: selectedSleep });
  };

  const handleGoalAction = (index: number) => {
    setDailyGoals((prev) =>
      prev.map((goal, i) => {
        if (i !== index) return goal;
        if (goal.status === "done") return goal;
        return { ...goal, status: "done" as const };
      })
    );
  };

  const getGoalActionLabel = (status: DashboardGoal["status"]) => {
    if (status === "done") return "Completed";
    if (status === "start") return "Start Now";
    if (status === "log") return "Mark Done";
    return "View";
  };

  if (authLoading) {
    return (
      <section className={`bg-background flex flex-col gap-4 items-center justify-center ${isFullDashboard ? "min-h-[calc(100dvh-73px)]" : "pt-16 lg:pt-20 pb-8 min-h-[600px]"}`}>
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-primary font-heading text-[11px] font-bold tracking-widest uppercase">
          Loading Preview...
        </p>
      </section>
    );
  }

  return (
  <section className={`bg-background ${isFullDashboard ? "min-h-[calc(100dvh-73px)]" : "pt-16 lg:pt-20 pb-8"}`}>
    <div className={`${isFullDashboard ? "w-full min-h-screen flex flex-col" : "max-w-[1400px] mx-auto px-5 lg:px-8"}`}>
      {!isFullDashboard && (
        <>
          <div className="py-4">
            <span className="section-label">APP DASHBOARD</span>
          </div>
          <div className="pb-6">
            <span className="section-label">YOUR DAILY HUB</span>
            <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3">
              THE DASHBOARD
            </h2>
          </div>
        </>
      )}

      <div className={`bg-card border border-border overflow-visible ${isFullDashboard ? "rounded-none flex-1" : "rounded-xl"}`}>
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-px bg-border ${isFullDashboard ? "min-h-full" : ""}`}>
          <Sidebar
            user={user}
            greetingName={greetingName}
            streak={streak}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            items={SIDEBAR_ITEMS}
            isFullDashboard={isFullDashboard}
          />

        {activeScreen === "HOME" ? (
          <HomeScreen
            isFullDashboard={isFullDashboard}
            user={user}
            displayNameShort={displayNameShort}
            now={now}
            dadsCount={dadsCount}
            hasCheckedInToday={hasCheckedInToday}
            selectedMood={selectedMood}
            selectedSleep={selectedSleep}
            setSelectedSleep={setSelectedSleep}
            onMoodSelect={handleMoodSelect}
            onDailyCheckIn={handleDailyCheckIn}
            checkInPending={checkIn.isPending}
            isCheckinBlocked={isCheckinBlocked}
            score={score}
            scoreItems={scoreItems}
            dailyGoals={dailyGoals}
            onGoalAction={handleGoalAction}
            getGoalActionLabel={getGoalActionLabel}
            moodWeek={moodWeek}
            moodSummary={moodSummary}
            reminders={reminders}
            challenge={(dashboard?.challenge as { title?: string; participants_count?: number } | null) ?? null}
            onGoProgress={() => setActiveScreen("PROGRESS")}
          />
        ) : (
          <>
            {activeScreen === "FITNESS" && (
              <FitnessScreen
                isFullDashboard={isFullDashboard}
                hasUser={hasUser}
                monthWorkouts={monthWorkouts}
                weightDisplay={dashboard?.weightDisplay as string | undefined}
                activeTodayMin={dashboard?.activeTodayMin as number | undefined}
                bodyWeekSeries={bodyWeekSeries}
                featuredWorkoutTitle={featuredWorkoutTitle}
                featuredWorkoutMeta={featuredWorkoutMeta}
              />
            )}
            {activeScreen === "MIND" && (
              <MindScreen
                isFullDashboard={isFullDashboard}
                moodWeek={moodWeek}
                moodLabels={DAYS}
              />
            )}
            {activeScreen === "BOND" && (
              <BondScreen
                isFullDashboard={isFullDashboard}
                dates={dates}
                milestones={milestones}
              />
            )}
            {activeScreen === "COMMUNITY" && (
              <CommunityScreen
                isFullDashboard={isFullDashboard}
                hasUser={hasUser}
                loading={communityLoading}
                posts={displayPosts}
                circles={circles}
              />
            )}
            {activeScreen === "PROGRESS" && (
              <ProgressScreen
                isFullDashboard={isFullDashboard}
                score={score}
                scoreItems={scoreItems}
                reportStatsList={reportStatsList}
              />
            )}
          </>
        )}
        </div>
      </div>
    </div>
  </section>
  );
};

export default DashboardPreview;