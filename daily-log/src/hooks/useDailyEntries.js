import { useCallback } from "react";
import useFileStorage from "./useFileStorage";
import {
  createEmptyEntry,
  getDateKey,
  parseStoredEntries,
  removeEntryByDate,
  upsertEntry,
} from "../utils/storage";

function useDailyEntries() {
  const {
    entries,
    fileName,
    isLoading,
    error,
    isSupported,
    isOpen,
    openExisting,
    createNew,
    saveEntries,
    closeFile,
  } = useFileStorage();

  const saveEntry = useCallback(
    (entry) => {
      const next = upsertEntry(parseStoredEntries(entries), entry);
      saveEntries(next);
    },
    [entries, saveEntries],
  );

  const deleteEntry = useCallback(
    (date) => {
      const next = removeEntryByDate(parseStoredEntries(entries), date);
      saveEntries(next);
    },
    [entries, saveEntries],
  );

  const clearEntries = useCallback(() => {
    saveEntries([]);
  }, [saveEntries]);

  const getEntryByDate = useCallback(
    (date = getDateKey()) =>
      entries.find((e) => e.date === date) ?? createEmptyEntry(date),
    [entries],
  );

  return {
    entries,
    fileName,
    isLoading,
    error,
    isSupported,
    isOpen,
    openExisting,
    createNew,
    closeFile,
    saveEntry,
    deleteEntry,
    clearEntries,
    getEntryByDate,
  };
}

export default useDailyEntries;
