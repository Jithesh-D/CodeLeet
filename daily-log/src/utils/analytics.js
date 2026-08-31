import { format, parseISO, startOfWeek } from "date-fns";
import { getSolvedDsaCount } from "./storage";

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function buildDailySeries(entries = []) {
  return entries.map((entry) => ({
    date: entry.date,
    day: format(parseISO(entry.date), "MMM d"),
    score: entry.score,
    studyHours: entry.studyHours,
    sleepHours: entry.sleepHours,
    socialScrollMinutes: entry.socialScrollMinutes,
  }));
}

export function buildWeeklyScoreSeries(entries = []) {
  const grouped = new Map();

  entries.forEach((entry) => {
    const bucketDate = startOfWeek(parseISO(entry.date), { weekStartsOn: 1 });
    const bucketKey = format(bucketDate, "yyyy-MM-dd");
    const current = grouped.get(bucketKey) ?? [];
    grouped.set(bucketKey, [...current, entry.score]);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, scores]) => ({
      week: format(parseISO(key), "MMM d"),
      averageScore: Number(average(scores).toFixed(2)),
    }));
}

export function getMetricSummary(entries = []) {
  if (!entries.length) {
    return {
      avgScore: 0,
      avgStudyHours: 0,
      avgSleepHours: 0,
      avgSocialScrollMinutes: 0,
    };
  }

  const scoreValues = entries.map((entry) => entry.score);
  const studyValues = entries.map((entry) => entry.studyHours);
  const sleepValues = entries.map((entry) => entry.sleepHours);
  const instagramValues = entries.map((entry) => entry.socialScrollMinutes);

  return {
    avgScore: Number(average(scoreValues).toFixed(2)),
    avgStudyHours: Number(average(studyValues).toFixed(2)),
    avgSleepHours: Number(average(sleepValues).toFixed(2)),
    avgSocialScrollMinutes: Number(average(instagramValues).toFixed(0)),
  };
}

export function getRecentEntries(entries = [], limit = 7) {
  return [...entries].slice(Math.max(entries.length - limit, 0));
}

export function getBestDay(entries = []) {
  if (!entries.length) return null;
  return entries.reduce((best, e) => (e.score > best.score ? e : best), entries[0]);
}

export function getMoodSeries(entries = []) {
  const MOOD_SCORE = { Focused: 5, Balanced: 4, Calm: 3, Tired: 2, Stressed: 1 };
  return entries.map((e) => ({
    day: format(parseISO(e.date), "MMM d"),
    mood: MOOD_SCORE[e.mood] ?? 3,
    moodLabel: e.mood,
  }));
}

export function getStudySleepSeries(entries = []) {
  return entries.map((e) => ({
    day: format(parseISO(e.date), "MMM d"),
    studyHours: e.studyHours,
    sleepHours: e.sleepHours,
  }));
}

export function getWeeklyDsaSeries(entries = []) {
  const grouped = new Map();
  entries.forEach((e) => {
    const bucketDate = startOfWeek(parseISO(e.date), { weekStartsOn: 1 });
    const key = format(bucketDate, "yyyy-MM-dd");
    const prev = grouped.get(key) ?? 0;
    grouped.set(key, prev + getSolvedDsaCount(e.dsaQuestions));
  });
  return [...grouped.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, solved]) => ({ week: format(parseISO(key), "MMM d"), solved }));
}

export function exportToCsv(entries = []) {
  const headers = ["date", "score", "mood", "studyHours", "sleepHours", "socialScrollMinutes", "dsaSolved", "habits", "notes"];
  const rows = entries.map((e) => [
    e.date,
    e.score,
    e.mood,
    e.studyHours,
    e.sleepHours,
    e.socialScrollMinutes,
    getSolvedDsaCount(e.dsaQuestions),
    (e.habits ?? []).join(" | "),
    `"${(e.notes ?? "").replace(/"/g, "'")}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
