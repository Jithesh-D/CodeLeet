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
    ? questions.filter((q) => q.solved).length
    : 0;
}

// Easy=1, Medium=2, Hard=3 — solved=full, bruteForce=half, unsolved=0
const DIFFICULTY_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };

export function getDsaWeight(questions = []) {
  if (!Array.isArray(questions)) return 0;
  return questions.reduce((sum, q) => {
    const base = DIFFICULTY_WEIGHT[q.difficulty] ?? 1;
    if (q.solved) return sum + base;
    if (q.bruteForce) return sum + base * 0.5;
    return sum;
  }, 0);
}

// essential topics each add +1 bonus, capped at +2
// total < 2 → red (5), < 4 → blue (7), < 7 → green (9), 7+ → gold (10)
export function getDailyProgress(dsaQuestions = [], essentialsStudy = []) {
  const weight = getDsaWeight(dsaQuestions);
  const essentialBonus = Math.min(
    Array.isArray(essentialsStudy) ? essentialsStudy.length : 0,
    2,
  );
  const total = weight + essentialBonus;

  if (total === 0) return "zero";
  if (total < 2) return "red";
  if (total < 4) return "blue";
  if (total < 7) return "green";
  return "gold";
}

export function getCalculatedScore(dsaQuestions = [], essentialsStudy = []) {
  const progress = getDailyProgress(dsaQuestions, essentialsStudy);
  return { zero: 0, red: 5, blue: 7, green: 9, gold: 10 }[progress];
}

function normalizeDsaQuestions(value) {
  if (!Array.isArray(value)) return [];
  return value.map((question) => ({
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

export function normalizeEntry(entry = {}, dateKey = entry.date ?? getDateKey()) {
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
    instagramMinutes: Math.min(
      parseNumber(entry.instagramMinutes, baseEntry.instagramMinutes),
      600,
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
  if (!Array.isArray(value)) return [];
  return sortEntriesByDate(
    value
      .map((entry) => normalizeEntry(entry, entry?.date))
      .filter((entry) => Boolean(entry.date)),
  );
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
