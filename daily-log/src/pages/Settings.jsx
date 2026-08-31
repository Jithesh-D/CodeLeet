import { useState } from "react";
import { FiDatabase, FiDownload, FiFile, FiFolderPlus, FiLock, FiTrash2, FiUpload } from "react-icons/fi";
import StatsCard from "../components/StatsCard/StatsCard";
import TrendCard from "../components/TrendCard/TrendCard";
import { useEntries } from "../components/AppShell";
import { exportEntriesPayload, getDateKey, importEntriesPayload, parseStoredEntries } from "../utils/storage";
import { exportToCsv } from "../utils/analytics";

function downloadTextFile(text, fileName) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function Settings() {
  const { entries, fileName, clearEntries, saveEntry, openExisting, createNew, closeFile } = useEntries();
  const [status, setStatus] = useState("");

  function handleCsvExport() {
    const csv = exportToCsv(entries);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-log-${getDateKey()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("CSV exported.");
  }

  function handleExport() {
    const payload = exportEntriesPayload(entries);
    downloadTextFile(JSON.stringify(payload, null, 2), `daily-log-backup-${getDateKey()}.json`);
    setStatus("Backup exported.");
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importEntriesPayload(String(reader.result));
        const normalized = parseStoredEntries(imported);
        normalized.forEach((entry) => saveEntry(entry));
        setStatus(`Merged ${normalized.length} entries into current file.`);
      } catch {
        setStatus("Import failed. Select a valid Daily Log JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleReset() {
    if (!window.confirm("Clear all entries from the current file? This cannot be undone.")) return;
    clearEntries();
    setStatus("All entries cleared from file.");
  }

  return (
    <section className="space-y-7">
      <div className="max-w-3xl space-y-3">
        <p className="mono-label text-xs font-semibold uppercase text-cyan-500">Settings</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          Your data lives in your file.
        </h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          No backend. No cloud. Every entry is written directly to your local <strong>.json</strong> file on save.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard label="Entries in file" value={entries.length} detail={fileName ?? "No file open"} />
        <StatsCard label="Storage mode" value="File" detail="Local .json file" accent="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendCard
          title="Switch file"
          subtitle="Open a different log file or start a new one"
          rightSlot={<FiFile className="h-5 w-5 text-cyan-500" />}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={createNew}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(6,182,212,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <FiFolderPlus className="h-4 w-4" />
              New file
            </button>
            <button
              type="button"
              onClick={openExisting}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <FiFile className="h-4 w-4" />
              Open file
            </button>
            <button
              type="button"
              onClick={closeFile}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-500 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            >
              Close file
            </button>
          </div>
        </TrendCard>

        <TrendCard
          title="Backup & restore"
          subtitle="Export a JSON backup or merge from another file"
          rightSlot={<FiDatabase className="h-5 w-5 text-cyan-500" />}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCsvExport}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              <FiDownload className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(6,182,212,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <FiDownload className="h-4 w-4" />
              Export backup
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <FiUpload className="h-4 w-4" />
              Merge from backup
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </TrendCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendCard
          title="Danger zone"
          subtitle="Clear all entries from the current file"
          rightSlot={<FiTrash2 className="h-5 w-5 text-rose-500" />}
        >
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/25 bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(244,63,94,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-400"
          >
            <FiTrash2 className="h-4 w-4" />
            Clear all entries
          </button>
        </TrendCard>

        <article className="surface-card p-6">
          <div className="flex items-center gap-3">
            <FiLock className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Privacy promise
            </h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your logs are written directly to a <strong>.json</strong> file on your device using the File System Access API. Nothing is ever transmitted to any server.
          </p>
          {status && (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {status}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}

export default Settings;
