import useLocalStorage from "./useLocalStorage";
import {
  createEmptyEntry,
  getDateKey,
  parseStoredEntries,
  removeEntryByDate,
  STORAGE_KEYS,
  upsertEntry,
} from "../utils/storage";

function useDailyEntries() {
  const [storedEntries, setStoredEntries] = useLocalStorage(
    STORAGE_KEYS.entries,
    [],
  );
  const entries = parseStoredEntries(storedEntries);

  function saveEntry(entry) {
    setStoredEntries((currentEntries) =>
      upsertEntry(parseStoredEntries(currentEntries), entry),
    );
  }

  function deleteEntry(date) {
    setStoredEntries((currentEntries) =>
      removeEntryByDate(parseStoredEntries(currentEntries), date),
    );
  }

  function clearEntries() {
    setStoredEntries([]);
  }

  function getEntryByDate(date = getDateKey()) {
    return (
      entries.find((entry) => entry.date === date) ?? createEmptyEntry(date)
    );
  }

  return {
    entries,
    saveEntry,
    deleteEntry,
    clearEntries,
    getEntryByDate,
  };
}

export default useDailyEntries;
