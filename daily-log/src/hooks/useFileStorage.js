import { useCallback, useRef, useState } from "react";
import { parseStoredEntries, sortEntriesByDate } from "../utils/storage";

// Persists the file handle across hot-reloads in dev (module-level ref)
let _cachedHandle = null;

async function readEntriesFromHandle(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  const parsed = JSON.parse(text);
  const raw = Array.isArray(parsed) ? parsed : parsed?.entries ?? [];
  return parseStoredEntries(raw);
}

async function writeEntriesToHandle(handle, entries) {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    entries: sortEntriesByDate(entries),
  };
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
}

function useFileStorage() {
  const handleRef = useRef(_cachedHandle);
  const [entries, setEntries] = useState(() => {
    // If we already have a handle from a previous render cycle, entries start empty
    // and get loaded via openExisting / createNew
    return [];
  });
  const [fileName, setFileName] = useState(
    _cachedHandle ? _cachedHandle.name : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported = typeof window !== "undefined" && "showOpenFilePicker" in window;

  const openExisting = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: "Daily Log JSON", accept: { "application/json": [".json"] } }],
        multiple: false,
      });
      const loaded = await readEntriesFromHandle(handle);
      handleRef.current = handle;
      _cachedHandle = handle;
      setFileName(handle.name);
      setEntries(loaded);
    } catch (err) {
      if (err.name !== "AbortError") setError("Could not open file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNew = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `daily-log-${new Date().toISOString().slice(0, 10)}.json`,
        types: [{ description: "Daily Log JSON", accept: { "application/json": [".json"] } }],
      });
      await writeEntriesToHandle(handle, []);
      handleRef.current = handle;
      _cachedHandle = handle;
      setFileName(handle.name);
      setEntries([]);
    } catch (err) {
      if (err.name !== "AbortError") setError("Could not create file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntries = useCallback(async (nextEntries) => {
    if (!handleRef.current) return;
    const sorted = sortEntriesByDate(nextEntries);
    setEntries(sorted);
    try {
      await writeEntriesToHandle(handleRef.current, sorted);
    } catch {
      setError("Failed to save. Check file permissions.");
    }
  }, []);

  const closeFile = useCallback(() => {
    handleRef.current = null;
    _cachedHandle = null;
    setEntries([]);
    setFileName(null);
    setError(null);
  }, []);

  return {
    entries,
    fileName,
    isLoading,
    error,
    isSupported,
    isOpen: Boolean(fileName),
    openExisting,
    createNew,
    saveEntries,
    closeFile,
  };
}

export default useFileStorage;
