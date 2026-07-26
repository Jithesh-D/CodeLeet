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

export const ESSENTIAL_STUDY_OPTIONS = [
  "OS",
  "System design",
  "CN",
  "DBMS",
  "Aptitude",
];

export function getDateKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function createEmptyEntry(dateKey = getDateKey()) {
  return {
    date: dateKey,
    score: 0,
    mood: "Balanced",
    studyHours: 0,
    sleepHours: 0,
    bedtime: "",
    instagramMinutes: 0,
    dsaQuestions: [],
    essentialsStudy: [],
    habits: [],
    notes: "",
    updatedAt: "",
  };
}

export function getSolvedDsaCount(questions = []) {
  return Array.isArray(questions)
    ? questions.filter((question) => question.solved).length
    : 0;
}

export function getDailyProgress(dsaQuestions = [], essentialsStudy = []) {
  const solvedCount = getSolvedDsaCount(dsaQuestions);
  const studiedEssential = Array.isArray(essentialsStudy) && essentialsStudy.length > 0;

  if (solvedCount === 0) return "zero";
  if (studiedEssential) {
    if (solvedCount === 1) return "blue";
    if (solvedCount === 2) return "green";
    return "gold";
  }
  if (solvedCount === 1) return "red";
  if (solvedCount === 2) return "blue";
  if (solvedCount === 3) return "green";
  return "gold";
}

export function getCalculatedScore(dsaQuestions = [], essentialsStudy = []) {
  const progress = getDailyProgress(dsaQuestions, essentialsStudy);

  return { zero: 0, red: 5, blue: 7, green: 9, gold: 10 }[progress];
}

function normalizeDsaQuestions(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((question) => ({
      difficulty: ["Easy", "Medium", "Hard"].includes(question?.difficulty)
        ? question.difficulty
        : "Easy",
      solved: Boolean(question?.solved),
      bruteForce: Boolean(question?.bruteForce),
      note: typeof question?.note === "string" ? question.note.slice(0, 20) : "",
      timeMinutes: Math.max(0, parseNumber(question?.timeMinutes, 0)),
    }));
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
  const dsaQuestions = normalizeDsaQuestions(entry.dsaQuestions);
  const essentialsStudy = Array.isArray(entry.essentialsStudy)
    ? entry.essentialsStudy.filter((topic) => ESSENTIAL_STUDY_OPTIONS.includes(topic))
    : [];

  return {
    ...baseEntry,
    ...entry,
    date: dateKey,
    score: getCalculatedScore(dsaQuestions, essentialsStudy),
    studyHours: parseNumber(entry.studyHours, baseEntry.studyHours),
    sleepHours: parseNumber(entry.sleepHours, baseEntry.sleepHours),
    instagramMinutes: parseNumber(
      entry.instagramMinutes,
      baseEntry.instagramMinutes,
    ),
    dsaQuestions,
    essentialsStudy,
    habits: Array.isArray(entry.habits) ? entry.habits.filter(Boolean) : [],
    notes: entry.notes ?? "",
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };
}

export function createFormState(entry = createEmptyEntry()) {
  const normalizedEntry = normalizeEntry(entry, entry.date);

  return {
    date: normalizedEntry.date,
    mood: normalizedEntry.mood,
    studyHours: String(normalizedEntry.studyHours || ""),
    sleepHours: String(normalizedEntry.sleepHours || ""),
    bedtime: normalizedEntry.bedtime,
    instagramMinutes: String(normalizedEntry.instagramMinutes || ""),
    dsaQuestions: normalizedEntry.dsaQuestions,
    essentialsStudy: normalizedEntry.essentialsStudy,
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
