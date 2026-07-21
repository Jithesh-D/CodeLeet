import { useState } from "react";
import {
  FiDatabase,
  FiDownload,
  FiLock,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import StatsCard from "../components/StatsCard/StatsCard";
import TrendCard from "../components/TrendCard/TrendCard";
import useDailyEntries from "../hooks/useDailyEntries";
import {
  exportEntriesPayload,
  getDateKey,
  importEntriesPayload,
  parseStoredEntries,
} from "../utils/storage";

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
  const { entries, clearEntries, saveEntry } = useDailyEntries();
  const [status, setStatus] = useState("");

  function handleExport() {
    const payload = exportEntriesPayload(entries);
    const text = JSON.stringify(payload, null, 2);
    downloadTextFile(text, `daily-log-${getDateKey()}.json`);
    setStatus("Export complete.");
  }

  function handleImport(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const importedEntries = importEntriesPayload(String(reader.result));
        const normalizedEntries = parseStoredEntries(importedEntries);
        normalizedEntries.forEach((entry) => saveEntry(entry));
        setStatus(`Imported ${normalizedEntries.length} entries.`);
      } catch {
        setStatus("Import failed. Please select a valid Daily Log JSON file.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function handleReset() {
    const hasConfirmed = window.confirm(
      "Delete all local logs? This action cannot be undone.",
    );

    if (!hasConfirmed) {
      return;
    }

    clearEntries();
    setStatus("All entries removed from local storage.");
  }

  return (
    <section className="space-y-7">
      <div className="max-w-3xl space-y-3">
        <p className="mono-label text-xs font-semibold uppercase text-cyan-500">
          Settings
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          Private by default, portable when needed.
        </h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          No backend. No API calls. Every record remains local unless you
          export.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Stored entries"
          value={entries.length}
          detail="In this browser"
        />
        <StatsCard
          label="Storage mode"
          value="Local"
          detail="Offline-first"
          accent="emerald"
        />
        <StatsCard
          label="Sync status"
          value="Disabled"
          detail="No cloud backend"
          accent="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendCard
          title="Data portability"
          subtitle="Export and import JSON backups"
          rightSlot={<FiDatabase className="h-5 w-5 text-cyan-500" />}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(6,182,212,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <FiDownload className="h-4 w-4" />
              Export JSON
            </button>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <FiUpload className="h-4 w-4" />
              Import JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </TrendCard>

        <TrendCard
          title="Danger zone"
          subtitle="Reset local data"
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
      </div>

      <article className="surface-card p-6">
        <div className="flex items-center gap-3">
          <FiLock className="h-5 w-5 text-cyan-500" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Privacy promise
          </h2>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Your logs are stored in browser localStorage and never transmitted.
          You remain in control of all data movement.
        </p>
        {status ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {status}
          </p>
        ) : null}
      </article>
    </section>
  );
}

export default Settings;
