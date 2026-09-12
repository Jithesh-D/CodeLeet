import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { eachDayOfInterval, endOfYear, format, getDay, startOfYear } from "date-fns";
import useLocalStorage from "../../hooks/useLocalStorage";

// ── Score logic ──────────────────────────────────────────────────────────────
// Base solve ratio  : (solved / total) * 50   → max 50
// Perseverance bonus: tried till last min → +30, quit → +0
// Rank bonus        : solved ≥ 50% → +20, ≥ 25% → +10, else +0
// Total max         : 100
function calcContestScore({ total, solved, triedTillEnd }) {
  if (!total || total === 0) return 0;
  const ratio = solved / total;
  const base = Math.round(ratio * 50);
  const perseverance = triedTillEnd ? 30 : 0;
  const rank = ratio >= 0.5 ? 20 : ratio >= 0.25 ? 10 : 0;
  return Math.min(base + perseverance + rank, 100);
}

function getCellLevel(log) {
  if (!log) return "empty";
  const score = calcContestScore(log);
  if (score >= 80) return "gold";
  if (score >= 50) return "green";
  if (score > 0) return "blue";
  return "zero";
}

const CELL_CLASS = {
  empty: "contribution-empty",
  zero: "contribution-zero",
  blue: "contribution-blue",
  green: "contribution-green",
  gold: "contribution-gold",
};

function mondayOffset(date) {
  return (getDay(date) + 6) % 7;
}

function buildYearGrid(year) {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(start);
  const days = eachDayOfInterval({ start, end });
  const startOffset = mondayOffset(start);
  const monthLabels = [];
  days.forEach((day, i) => {
    if (day.getDate() === 1) {
      const col = Math.floor((i + startOffset) / 7) + 1;
      monthLabels.push({ col, label: format(day, "MMM") });
    }
  });
  return { days, startOffset, monthLabels };
}

// ── Log modal ─────────────────────────────────────────────────────────────────
function ContestModal({ dateKey, existing, onSave, onClose }) {
  const [total, setTotal] = useState(String(existing?.total ?? ""));
  const [solved, setSolved] = useState(String(existing?.solved ?? ""));
  const [triedTillEnd, setTriedTillEnd] = useState(existing?.triedTillEnd ?? true);
  const [platform, setPlatform] = useState(existing?.platform ?? "");

  const totalNum = Math.max(0, parseInt(total) || 0);
  const solvedNum = Math.min(Math.max(0, parseInt(solved) || 0), totalNum);
  const preview = totalNum > 0 ? calcContestScore({ total: totalNum, solved: solvedNum, triedTillEnd }) : null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!totalNum) return;
    onSave({ date: dateKey, total: totalNum, solved: solvedNum, triedTillEnd, platform: platform.trim() });
  }

  const scoreColor =
    preview >= 80 ? "text-amber-500" : preview >= 50 ? "text-emerald-500" : preview > 0 ? "text-blue-500" : "text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="surface-card relative z-10 w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mono-label text-xs font-semibold uppercase text-orange-500">Contest Log</p>
        <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-50">
          {format(new Date(`${dateKey}T00:00:00`), "EEE, MMM d yyyy")}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Platform */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Platform <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. LeetCode, Codeforces…"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
            />
          </div>

          {/* Total / Solved */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total questions
              </label>
              <input
                required
                type="number"
                min="1"
                placeholder="e.g. 4"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Questions solved
              </label>
              <input
                required
                type="number"
                min="0"
                max={totalNum || undefined}
                placeholder="e.g. 2"
                value={solved}
                onChange={(e) => setSolved(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
              />
            </div>
          </div>

          {/* Perseverance toggle */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Contest attitude
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTriedTillEnd(true)}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-xs font-semibold transition-all ${
                  triedTillEnd
                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200/60 bg-slate-50/60 text-slate-500 dark:border-white/8 dark:bg-white/3 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">💪</span>
                <span>Tried till last minute</span>
                <span className="text-[10px] font-normal opacity-70">+30 pts bonus</span>
              </button>
              <button
                type="button"
                onClick={() => setTriedTillEnd(false)}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-xs font-semibold transition-all ${
                  !triedTillEnd
                    ? "border-rose-400/60 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border-slate-200/60 bg-slate-50/60 text-slate-500 dark:border-white/8 dark:bg-white/3 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">🚪</span>
                <span>Quit contest</span>
                <span className="text-[10px] font-normal opacity-70">no bonus</span>
              </button>
            </div>
          </div>

          {/* Score preview */}
          {preview !== null && (
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3 dark:border-white/8 dark:bg-white/3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Contest score preview</p>
              <p className={`mt-0.5 text-2xl font-extrabold ${scoreColor}`}>
                {preview}
                <span className="ml-1 text-xs font-medium text-slate-400">/100</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Solve ratio {Math.round((solvedNum / totalNum) * 100)}% · perseverance {triedTillEnd ? "+30" : "+0"} · rank bonus {preview >= 80 ? "+20" : preview >= 50 ? "+10" : "+0"}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main heatmap ──────────────────────────────────────────────────────────────
function ContestHeatmap() {
  const [logs, setLogs] = useLocalStorage("contest-heatmap-logs", {});
  const [modalDate, setModalDate] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const { days, startOffset, monthLabels } = buildYearGrid(year);
  const totalCols = Math.ceil((days.length + startOffset) / 7);

  const yearLogs = Object.entries(logs).filter(([d]) => d.startsWith(String(year)));
  const totalContests = yearLogs.length;
  const totalSolved = yearLogs.reduce((s, [, l]) => s + (l.solved ?? 0), 0);
  const totalQuestions = yearLogs.reduce((s, [, l]) => s + (l.total ?? 0), 0);
  const avgScore =
    totalContests > 0
      ? Math.round(yearLogs.reduce((s, [, l]) => s + calcContestScore(l), 0) / totalContests)
      : 0;
  const triedCount = yearLogs.filter(([, l]) => l.triedTillEnd).length;

  function handleSave(log) {
    setLogs((prev) => ({ ...prev, [log.date]: log }));
    setModalDate(null);
  }

  function handleCellClick(dateKey) {
    setModalDate(dateKey);
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="surface-card contribution-card p-5 sm:p-6"
      >
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mono-label text-xs font-semibold uppercase text-orange-500">Contest Tracker</p>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              <span className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {totalContests}
              </span>
              <span className="text-sm"> contests in {year}</span>
              {avgScore > 0 && (
                <span className={`ml-2 text-sm font-semibold ${avgScore >= 80 ? "text-amber-500" : avgScore >= 50 ? "text-emerald-500" : "text-blue-500"}`}>
                  · avg {avgScore}/100
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Click any cell to log a contest. Gold ≥ 80 · Green ≥ 50 · Blue &gt; 0
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalDate(format(today, "yyyy-MM-dd"))}
            className="self-start rounded-full border border-orange-400/30 bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(249,115,22,0.28)] transition hover:bg-orange-400"
          >
            + Log today's contest
          </button>
        </div>

        {/* Stats row */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Contests", value: totalContests, color: "text-orange-500" },
            { label: "Solved", value: `${totalSolved}/${totalQuestions}`, color: "text-violet-500" },
            { label: "Avg score", value: `${avgScore}/100`, color: avgScore >= 80 ? "text-amber-500" : avgScore >= 50 ? "text-emerald-500" : "text-blue-500" },
            { label: "Tried till end", value: `${triedCount}/${totalContests}`, color: "text-emerald-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/8 dark:bg-white/3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className={`mt-1 text-lg font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="contribution-scroll overflow-x-auto pb-2">
          <div
            className="contribution-graph"
            style={{ gridTemplateColumns: `repeat(${totalCols}, var(--cell-size))` }}
          >
            {monthLabels.map(({ col, label }) => (
              <span
                key={label}
                className="contribution-month-label"
                style={{ gridColumn: col, gridRow: 1 }}
              >
                {label}
              </span>
            ))}

            {days.map((date, i) => {
              const absIdx = i + startOffset;
              const col = Math.floor(absIdx / 7) + 1;
              const row = (absIdx % 7) + 2;
              const dateKey = format(date, "yyyy-MM-dd");
              const log = logs[dateKey];
              const level = getCellLevel(log);
              const score = log ? calcContestScore(log) : null;
              const tip = log
                ? `${format(date, "EEE, MMM d, yyyy")} · ${log.solved}/${log.total} solved · score ${score}/100${log.platform ? ` · ${log.platform}` : ""}${log.triedTillEnd ? " · 💪 tried till end" : " · 🚪 quit"}`
                : `${format(date, "EEE, MMM d, yyyy")} · click to log`;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleCellClick(dateKey)}
                  className={["contribution-cell", CELL_CLASS[level]].join(" ")}
                  title={tip}
                  aria-label={tip}
                  style={{ gridColumn: col, gridRow: row }}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>Less</p>
          <div className="flex items-center gap-1.5" aria-label="Contest heatmap legend">
            <span className="contribution-key contribution-empty" title="No contest" />
            <span className="contribution-key contribution-zero" title="Score 0" />
            <span className="contribution-key contribution-blue" title="Score 1–49" />
            <span className="contribution-key contribution-green" title="Score 50–79" />
            <span className="contribution-key contribution-gold" title="Score ≥ 80" />
          </div>
          <p>More</p>
        </div>

        {/* Score breakdown info */}
        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-slate-50/40 px-4 py-3 text-xs text-slate-500 dark:border-white/8 dark:bg-white/3 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Score formula: </span>
          (solved/total) × 50 &nbsp;+&nbsp; perseverance (tried till end +30) &nbsp;+&nbsp; rank bonus (≥50% solved +20, ≥25% +10)
        </div>
      </motion.section>

      <AnimatePresence>
        {modalDate && (
          <ContestModal
            key={modalDate}
            dateKey={modalDate}
            existing={logs[modalDate] ?? null}
            onSave={handleSave}
            onClose={() => setModalDate(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ContestHeatmap;
