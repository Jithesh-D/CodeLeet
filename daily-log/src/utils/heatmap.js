import { endOfYear, format, parseISO, startOfYear } from "date-fns";
import { getDailyProgress, getSolvedDsaCount } from "./storage";

export function getHeatmapLevel(entry = {}) {
  return getDailyProgress(entry.dsaQuestions, entry.essentialsStudy, entry.revision);
}

export function getYearBounds(year = new Date().getFullYear()) {
  const date = new Date(year, 0, 1);
  return {
    startDate: startOfYear(date),
    endDate: endOfYear(date),
  };
}

export function buildHeatmapValues(entries = [], year = new Date().getFullYear()) {
  return entries
    .filter((entry) => Number(entry.date.slice(0, 4)) === Number(year))
    .map((entry) => ({
      date: entry.date,
      count: getHeatmapLevel(entry),
      score: entry.score,
      mood: entry.mood,
      solvedDsaCount: getSolvedDsaCount(entry.dsaQuestions),
      essentialsStudy: entry.essentialsStudy ?? [],
      revision: entry.revision ?? [],
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
