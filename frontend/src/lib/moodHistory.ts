export type MoodSource = "chat" | "journal";

export interface MoodRecord {
  id: string;
  timestamp: number;
  mood: string;
  severity: number;
  isEmergency: boolean;
  source: MoodSource;
  text?: string;
  tags?: string[];
  energy?: number;
  title?: string;
}

const STORAGE_KEY = "neurawell:mood-history";

function readAll(): MoodRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MoodRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: MoodRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("neurawell:mood-updated"));
}

export function getMoodHistory(): MoodRecord[] {
  return readAll().sort((a, b) => a.timestamp - b.timestamp);
}

export function addMoodRecord(record: Omit<MoodRecord, "id" | "timestamp">): MoodRecord {
  const full: MoodRecord = {
    ...record,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  const all = readAll();
  all.push(full);
  writeAll(all);
  return full;
}

export function deleteMoodRecord(id: string): void {
  const all = readAll().filter((r) => r.id !== id);
  writeAll(all);
}

export function clearMoodHistory(): void {
  writeAll([]);
}

export function getJournalEntries(): MoodRecord[] {
  return getMoodHistory().filter((r) => r.source === "journal");
}

export function getLatestMood(): MoodRecord | null {
  const all = getMoodHistory();
  return all.length ? all[all.length - 1] : null;
}

export function getJournalStreak(): number {
  const journalEntries = getJournalEntries();
  if (journalEntries.length === 0) return 0;

  const dates = Array.from(
    new Set(journalEntries.map((e) => new Date(e.timestamp).toISOString().slice(0, 10)))
  ).sort((a, b) => b.localeCompare(a));

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Check if user journaled today or yesterday to maintain active streak
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(dates[0]);

  for (const dStr of dates) {
    const d = new Date(dStr);
    const diffDays = Math.round(
      (currentDate.getTime() - d.getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays <= 1) {
      streak += 1;
      currentDate = d;
    } else {
      break;
    }
  }

  return streak;
}

export interface DailyTrendPoint {
  date: string;
  avgSeverity: number;
  count: number;
}

export function getSeverityTrend(days = 14): DailyTrendPoint[] {
  const all = getMoodHistory();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const buckets = new Map<string, { total: number; count: number }>();

  for (const record of all) {
    if (record.timestamp < cutoff) continue;
    const date = new Date(record.timestamp).toISOString().slice(0, 10);
    const bucket = buckets.get(date) ?? { total: 0, count: 0 };
    bucket.total += record.severity;
    bucket.count += 1;
    buckets.set(date, bucket);
  }

  return Array.from(buckets.entries())
    .map(([date, { total, count }]) => ({
      date,
      avgSeverity: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getAverageSeverity(): number {
  const all = getMoodHistory();
  if (!all.length) return 0;
  const total = all.reduce((sum, r) => sum + r.severity, 0);
  return Math.round((total / all.length) * 10) / 10;
}
