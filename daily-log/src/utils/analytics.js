import { format, parseISO, startOfWeek } from "date-fns";

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
    instagramMinutes: entry.instagramMinutes,
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
      avgInstagramMinutes: 0,
    };
  }

  const scoreValues = entries.map((entry) => entry.score);
  const studyValues = entries.map((entry) => entry.studyHours);
  const sleepValues = entries.map((entry) => entry.sleepHours);
  const instagramValues = entries.map((entry) => entry.instagramMinutes);

  return {
    avgScore: Number(average(scoreValues).toFixed(2)),
    avgStudyHours: Number(average(studyValues).toFixed(2)),
    avgSleepHours: Number(average(sleepValues).toFixed(2)),
    avgInstagramMinutes: Number(average(instagramValues).toFixed(0)),
  };
}

export function getRecentEntries(entries = [], limit = 7) {
  return [...entries].slice(Math.max(entries.length - limit, 0));
}
