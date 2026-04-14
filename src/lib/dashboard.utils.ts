type DashboardData = {
  total_score?: number | string | null;
  mind_score?: number | null;
  body_score?: number | null;
  bond_score?: number | null;
  reportStats?: {
    workouts?: number;
    journal?: number;
    dadDates?: number;
  };
};

type MoodLog = {
  date: string;
  mood_value: number;
};

const DEFAULT_SCORES = {
  mind: 72,
  body: 81,
  bond: 68,
} as const;

export function getDashboardScore(dashboard: DashboardData | null | undefined, hasUser: boolean): number | null {
  if (typeof dashboard?.total_score === "number") return Math.round(dashboard.total_score);
  return hasUser ? 74 : null;
}

export function getScoreBreakdown(dashboard: DashboardData | null | undefined, hasUser: boolean) {
  if (!hasUser || !dashboard) return { mind: 0, body: 0, bond: 0 };
  return {
    mind: Math.min(100, Math.round(dashboard.mind_score ?? DEFAULT_SCORES.mind)),
    body: Math.min(100, Math.round(dashboard.body_score ?? DEFAULT_SCORES.body)),
    bond: Math.min(100, Math.round(dashboard.bond_score ?? DEFAULT_SCORES.bond)),
  };
}

export function getLastSevenDayKeys() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function getMoodWeek(moodLogs: MoodLog[], dayKeys: string[]) {
  const moodMap = new Map(moodLogs.map((m) => [m.date, m.mood_value]));
  return dayKeys.map((d) => moodMap.get(d) ?? 0);
}

export function getMoodSummary(moodWeek: number[], hasUser: boolean) {
  if (!hasUser || moodWeek.length === 0) return { label: "—", scoreText: "" };
  const validMoodValues = moodWeek.filter((v) => v > 0);
  if (validMoodValues.length === 0) return { label: "—", scoreText: "" };
  const avg = validMoodValues.reduce((a, b) => a + b, 0) / validMoodValues.length;
  const label = avg >= 3.5 ? "Great" : avg >= 3 ? "Good" : avg >= 2 ? "Okay" : "Low";
  const scoreText = ` (${avg.toFixed(1)}/4)`;
  return { label, scoreText };
}

export function getReportStatsList(reportStats: DashboardData["reportStats"]) {
  if (!reportStats) return [["—", "Workouts"], ["—", "Journal"], ["—", "Dad dates"]] as const;
  return [
    [String(reportStats.workouts ?? "—"), "Workouts"],
    [String(reportStats.journal ?? "—"), "Journal"],
    [String(reportStats.dadDates ?? "—"), "Dad dates"],
  ] as const;
}
