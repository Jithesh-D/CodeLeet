import { useCallback, useRef, useState } from "react";
import { parseStoredEntries, sortEntriesByDate } from "../utils/storage";

const LAST_FILE_KEY = "daily-log-last-filename";

// Module-level handle survives hot-reloads in dev
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
  const writeQueueRef = useRef(Promise.resolve()); // serialise writes

  const [entries, setEntries] = useState([]);
  const [fileName, setFileName] = useState(_cachedHandle ? _cachedHandle.name : null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null); // persistent banner for write failures

  const lastFileName =
    typeof window !== "undefined"
      ? window.localStorage.getItem(LAST_FILE_KEY)
      : null;

  const isSupported =
    typeof window !== "undefined" && "showOpenFilePicker" in window;

  function _setHandle(handle, loaded) {
    handleRef.current = handle;
    _cachedHandle = handle;
    window.localStorage.setItem(LAST_FILE_KEY, handle.name);
    setFileName(handle.name);
    setEntries(loaded);
    setSaveError(null);
  }

  const openExisting = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: "Daily Log JSON", accept: { "application/json": [".json"] } }],
        multiple: false,
      });
      const loaded = await readEntriesFromHandle(handle);
      _setHandle(handle, loaded);
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
      _setHandle(handle, []);
    } catch (err) {
      if (err.name !== "AbortError") setError("Could not create file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Writes are queued so rapid saves never race/corrupt the file.
  // State is updated only AFTER a successful write.
  const saveEntries = useCallback((nextEntries) => {
    if (!handleRef.current) return;
    const sorted = sortEntriesByDate(nextEntries);

    writeQueueRef.current = writeQueueRef.current.then(async () => {
      try {
        await writeEntriesToHandle(handleRef.current, sorted);
        setEntries(sorted); // update state only after successful write
        setSaveError(null);
      } catch {
        setSaveError("Save failed — check file permissions or disk space.");
      }
    });
  }, []);

  const closeFile = useCallback(() => {
    handleRef.current = null;
    _cachedHandle = null;
    window.localStorage.removeItem(LAST_FILE_KEY);
    setEntries([]);
    setFileName(null);
    setError(null);
    setSaveError(null);
  }, []);

  return {
    entries,
    fileName,
    lastFileName,   // used by FileGate to show "reopen last file" prompt
    isLoading,
    error,
    saveError,      // persistent banner shown in AppShell
    isSupported,
    isOpen: Boolean(fileName),
    openExisting,
    createNew,
    saveEntries,
    closeFile,
  };
}

export default useFileStorage;
