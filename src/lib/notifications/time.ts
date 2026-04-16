export type LocalParts = {
  /** YYYY-MM-DD */
  localDate: string;
  /** 0-6 where 0=Sunday */
  localDow: number;
  /** HH:MM (24h) */
  localHHMM: string;
};

export function getLocalParts(now: Date, timeZone: string): LocalParts {
  // en-CA gives YYYY-MM-DD reliably
  const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
  const dowFmt = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" });

  const localDate = dateFmt.format(now);
  const localHHMM = timeFmt.format(now);
  const dowShort = dowFmt.format(now);

  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const localDow = map[dowShort] ?? 0;
  return { localDate, localDow, localHHMM };
}

export function hhmmFromPgTime(t: string): string {
  // "HH:MM:SS" -> "HH:MM"
  const m = /^(\d{2}):(\d{2})/.exec(t);
  if (!m) return t;
  return `${m[1]}:${m[2]}`;
}

export function subtractMinutes(hhmm: string, minutes: number): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const min = Number(m[2]);
  let total = h * 60 + min - minutes;
  total = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function isInWindow(localHHMM: string, targetHHMM: string, windowMinutes = 15): boolean {
  const toMin = (s: string) => {
    const m = /^(\d{2}):(\d{2})$/.exec(s);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const nowM = toMin(localHHMM);
  const targetM = toMin(targetHHMM);
  if (nowM == null || targetM == null) return false;
  return nowM >= targetM && nowM < targetM + windowMinutes;
}

