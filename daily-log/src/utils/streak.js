import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  subDays,
} from "date-fns";

function toUniqueSortedDates(entries = []) {
  const uniqueDateSet = new Set(
    entries.map((entry) => entry.date).filter(Boolean),
  );

  return [...uniqueDateSet].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

export function getCurrentStreak(entries = [], today = new Date()) {
  const sortedDates = toUniqueSortedDates(entries);

  if (!sortedDates.length) {
    return 0;
  }

  const dateSet = new Set(sortedDates);
  let cursor = format(today, "yyyy-MM-dd");
  let streak = 0;

  if (!dateSet.has(cursor)) {
    cursor = format(subDays(today, 1), "yyyy-MM-dd");

    if (!dateSet.has(cursor)) {
      return 0;
    }
  }

  while (dateSet.has(cursor)) {
    streak += 1;
    const nextCursor = subDays(parseISO(cursor), 1);
    cursor = format(nextCursor, "yyyy-MM-dd");
  }

  return streak;
}

export function getLongestStreak(entries = []) {
  const sortedDates = toUniqueSortedDates(entries);

  if (!sortedDates.length) {
    return 0;
  }

  let longest = 1;
  let running = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previousDate = parseISO(sortedDates[index - 1]);
    const currentDate = parseISO(sortedDates[index]);

    if (differenceInCalendarDays(currentDate, previousDate) === 1) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  return longest;
}

export function getStreakMeta(entries = []) {
  return {
    current: getCurrentStreak(entries),
    longest: getLongestStreak(entries),
  };
}

export function getMissedDays(entries = [], lookbackDays = 30) {
  const dateSet = new Set(entries.map((e) => e.date));
  const today = new Date();
  const missed = [];
  for (let i = 1; i <= lookbackDays; i++) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    if (!dateSet.has(key)) missed.push(key);
  }
  return missed;
}

export function getCompletedDatesBetween(entries = [], startDate, endDate) {
  const dateSet = new Set(toUniqueSortedDates(entries));
  const days = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    const dateKey = format(cursor, "yyyy-MM-dd");
    if (dateSet.has(dateKey)) {
      days.push(dateKey);
    }
    cursor = addDays(cursor, 1);
  }

  return days;
}
