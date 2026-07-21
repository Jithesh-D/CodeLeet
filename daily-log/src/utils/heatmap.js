import { endOfYear, format, parseISO, startOfYear } from "date-fns";

function toIntensity(score = 0) {
  if (score <= 0) return 0;
  if (score <= 3) return 1;
  if (score <= 5) return 2;
  if (score <= 7) return 3;
  return 4;
}

export function getYearBounds(year = new Date().getFullYear()) {
  const date = new Date(year, 0, 1);

  return {
    startDate: startOfYear(date),
    endDate: endOfYear(date),
  };
}

export function buildHeatmapValues(
  entries = [],
  year = new Date().getFullYear(),
) {
  return entries
    .filter((entry) => Number(entry.date.slice(0, 4)) === Number(year))
    .map((entry) => ({
      date: entry.date,
      count: toIntensity(entry.score),
      score: entry.score,
      mood: entry.mood,
    }));
}

export function getHeatmapLookup(entries = []) {
  const map = new Map();

  entries.forEach((entry) => {
    map.set(entry.date, entry);
  });

  return map;
}

export function formatHeatmapDate(value) {
  return format(parseISO(value), "MMM d, yyyy");
}
