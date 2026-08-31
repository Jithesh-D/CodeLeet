import { format } from "date-fns";

export const STORAGE_KEYS = {
  entries: "daily-log-entries",
  theme: "daily-log-theme",
};

export const MOOD_OPTIONS = ["Balanced", "Focused", "Calm", "Tired", "Stressed"];

export const HABIT_OPTIONS = [
  "Workout", "Water", "Meditation", "Reading", "Deep work", "Walk",
];

// Essential = new topic studied today (no overlap with revision)
export const ESSENTIAL_STUDY_OPTIONS = [
  "OS", "System design", "CN", "DBMS", "Aptitude",
];

// Revision = revisiting previously studied material
// Intentionally separate from ESSENTIAL_STUDY_OPTIONS to prevent double-counting
export const REVISION_OPTIONS = [
  "DSA concepts", "OS revision", "System design revision",
  "CN revision", "DBMS revision", "Math / Aptitude",
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
    socialScrollMinutes: 0,
    dsaQuestions: [],
    essentialsStudy: [],
    revision: [],
    habits: [],
    notes: "",
    updatedAt: "",
  };
}

export function getSolvedDsaCount(questions = []) {
  return Array.isArray(questions) ? questions.filter((q) => q.solved).length : 0;
}

export function getTotalDsaCount(questions = []) {
  return Array.isArray(questions) ? questions.length : 0;
}

// Easy=1, Medium=2, Hard=3
// solved = full weight, bruteForce (not solved) = half, learntNew = +0.5 bonus
const DIFFICULTY_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };

export function getDsaWeight(questions = []) {
  if (!Array.isArray(questions)) return 0;
  return questions.reduce((sum, q) => {
    const base = DIFFICULTY_WEIGHT[q.difficulty] ?? 1;
    let w = 0;
    if (q.solved) w += base;
    else if (q.bruteForce) w += base * 0.5;
    if (q.learntNew) w += 0.5;
    return sum + w;
  }, 0);
}

// Heatmap colour: total questions added + essential bonus (cap +2) + revision bonus (cap +1)
// Revision gets a smaller cap here since it's reinforcement not new learning
export function getDailyProgress(dsaQuestions = [], essentialsStudy = [], revision = []) {
  const total = getTotalDsaCount(dsaQuestions);
  const essentialBonus = Math.min(Array.isArray(essentialsStudy) ? essentialsStudy.length : 0, 2);
  const revisionBonus = Math.min(Array.isArray(revision) ? revision.length : 0, 1);
  const count = total + essentialBonus + revisionBonus;

  if (count === 0) return "zero";
  if (count < 2) return "red";
  if (count < 4) return "blue";
  if (count < 7) return "green";
  return "gold";
}

// Score: solved weight + essential bonus (cap +2) + revision bonus (cap +1)
// Combined cap of +3 prevents reaching gold purely through topic selection
export function getCalculatedScore(dsaQuestions = [], essentialsStudy = [], revision = []) {
  const weight = getDsaWeight(dsaQuestions);
  const essentialBonus = Math.min(Array.isArray(essentialsStudy) ? essentialsStudy.length : 0, 2);
  const revisionBonus = Math.min(Array.isArray(revision) ? revision.length : 0, 1);
  const total = weight + essentialBonus + revisionBonus;

  if (total === 0) return 0;
  if (total < 2) return 5;
  if (total < 4) return 7;
  if (total < 7) return 9;
  return 10;
}

function normalizeDsaQuestions(value) {
  if (!Array.isArray(value)) return [];
  return value.map((question) => ({
    difficulty: ["Easy", "Medium", "Hard"].includes(question?.difficulty)
      ? question.difficulty
      : "Easy",
    solved: Boolean(question?.solved),
    // bruteForce is only meaningful when not solved — clear it if solved
    bruteForce: Boolean(question?.solved) ? false : Boolean(question?.bruteForce),
    learntNew: Boolean(question?.learntNew),
    note: typeof question?.note === "string" ? question.note.slice(0, 20) : "",
    // timeMinutes only meaningful when solved — clear it if unsolved
    timeMinutes: Boolean(question?.solved)
      ? Math.max(0, parseNumber(question?.timeMinutes, 0))
      : 0,
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
    ? entry.essentialsStudy.filter((t) => ESSENTIAL_STUDY_OPTIONS.includes(t))
    : [];
  const revision = Array.isArray(entry.revision)
    ? entry.revision.filter((t) => REVISION_OPTIONS.includes(t))
    : [];

  return {
    ...baseEntry,
    ...entry,
    date: dateKey,
    score: getCalculatedScore(dsaQuestions, essentialsStudy, revision),
    studyHours: parseNumber(entry.studyHours, baseEntry.studyHours),
    sleepHours: parseNumber(entry.sleepHours, baseEntry.sleepHours),
    socialScrollMinutes: Math.min(
      parseNumber(entry.socialScrollMinutes ?? entry.instagramMinutes, baseEntry.socialScrollMinutes),
      600,
    ),
    dsaQuestions,
    essentialsStudy,
    revision,
    habits: Array.isArray(entry.habits) ? entry.habits.filter(Boolean) : [],
    notes: typeof entry.notes === "string" ? entry.notes.slice(0, 500) : "",
    updatedAt: entry.updatedAt || new Date().toISOString(),
  };
}

export function createFormState(entry = createEmptyEntry()) {
  const n = normalizeEntry(entry, entry.date);
  return {
    date: n.date,
    mood: n.mood,
    studyHours: String(n.studyHours || ""),
    sleepHours: String(n.sleepHours || ""),
    bedtime: n.bedtime,
    socialScrollMinutes: String(n.socialScrollMinutes || ""),
    dsaQuestions: n.dsaQuestions,
    essentialsStudy: n.essentialsStudy,
    revision: n.revision,
    habits: n.habits,
    notes: n.notes,
  };
}

export function sortEntriesByDate(entries = []) {
  return [...entries].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
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
  const normalized = normalizeEntry(nextEntry, nextEntry?.date);
  return sortEntriesByDate([
    ...entries.filter((e) => e.date !== normalized.date),
    normalized,
  ]);
}

export function removeEntryByDate(entries = [], date) {
  return sortEntriesByDate(entries.filter((e) => e.date !== date));
}

export function exportEntriesPayload(entries = []) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: sortEntriesByDate(entries),
  };
}

export function importEntriesPayload(rawText = "") {
  const parsed = JSON.parse(rawText);
  const raw = Array.isArray(parsed) ? parsed : parsed?.entries;
  return parseStoredEntries(raw);
}
