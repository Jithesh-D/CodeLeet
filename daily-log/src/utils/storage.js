import { format } from "date-fns";

export const STORAGE_KEYS = {
  entries: "daily-log-entries",
  theme: "daily-log-theme",
};

export const MOOD_OPTIONS = [
  "Balanced",
  "Focused",
  "Calm",
  "Tired",
  "Stressed",
];

export const HABIT_OPTIONS = [
  "Workout",
  "Water",
  "Meditation",
  "Reading",
  "Deep work",
  "Walk",
];

export function getDateKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function createEmptyEntry(dateKey = getDateKey()) {
  return {
    date: dateKey,
    score: 5,
    mood: "Balanced",
    studyHours: 0,
    sleepHours: 0,
    bedtime: "",
    instagramMinutes: 0,
    habits: [],
    notes: "",
    updatedAt: "",
  };
}

function parseNumber(value, fallback = 0) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function normalizeEntry(
  entry = {},
  dateKey = entry.date ?? getDateKey(),
) {
  const baseEntry = createEmptyEntry(dateKey);

  return {
    ...baseEntry,
    ...entry,
    date: dateKey,
    score: parseNumber(entry.score, baseEntry.score),
    studyHours: parseNumber(entry.studyHours, baseEntry.studyHours),
    sleepHours: parseNumber(entry.sleepHours, baseEntry.sleepHours),
    instagramMinutes: parseNumber(
      entry.instagramMinutes,
      baseEntry.instagramMinutes,
    ),
    habits: Array.isArray(entry.habits) ? entry.habits.filter(Boolean) : [],
    notes: entry.notes ?? "",
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };
}

export function createFormState(entry = createEmptyEntry()) {
  const normalizedEntry = normalizeEntry(entry, entry.date);

  return {
    date: normalizedEntry.date,
    score: String(normalizedEntry.score),
    mood: normalizedEntry.mood,
    studyHours: String(normalizedEntry.studyHours || ""),
    sleepHours: String(normalizedEntry.sleepHours || ""),
    bedtime: normalizedEntry.bedtime,
    instagramMinutes: String(normalizedEntry.instagramMinutes || ""),
    habits: normalizedEntry.habits,
    notes: normalizedEntry.notes,
  };
}

export function sortEntriesByDate(entries = []) {
  return [...entries].sort((left, right) =>
    left.date < right.date ? -1 : left.date > right.date ? 1 : 0,
  );
}

export function parseStoredEntries(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedEntries = value
    .map((entry) => normalizeEntry(entry, entry?.date))
    .filter((entry) => Boolean(entry.date));

  return sortEntriesByDate(normalizedEntries);
}

export function upsertEntry(entries = [], nextEntry = {}) {
  const normalizedEntry = normalizeEntry(nextEntry, nextEntry?.date);
  const filteredEntries = entries.filter(
    (entry) => entry.date !== normalizedEntry.date,
  );

  return sortEntriesByDate([...filteredEntries, normalizedEntry]);
}

export function removeEntryByDate(entries = [], date) {
  return sortEntriesByDate(entries.filter((entry) => entry.date !== date));
}

export function exportEntriesPayload(entries = []) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: sortEntriesByDate(entries),
  };
}

export function importEntriesPayload(rawText = "") {
  const parsedValue = JSON.parse(rawText);
  const incomingEntries = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.entries;

  return parseStoredEntries(incomingEntries);
}
