import { motion } from "framer-motion";
import { useState } from "react";
import { eachDayOfInterval, endOfYear, format, getDay, startOfYear } from "date-fns";
import { getHeatmapLookup } from "../../utils/heatmap";
import { getDsaProgressQuestions } from "../../utils/storage";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const DIFF_COLORS = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
  All: "text-cyan-600 dark:text-cyan-400",
};

function getDsaStats(entry, difficulty) {
  const questions = getDsaProgressQuestions(entry?.dsaQuestions ?? []);
  if (!questions.length) return { total: 0, solved: 0 };
  const filteredQuestions =
    difficulty === "All"
      ? questions
      : questions.filter((q) => q.difficulty === difficulty);
  return {
    total: filteredQuestions.length,
    solved: filteredQuestions.filter((q) => q.solved).length,
  };
}

function getDsaCellLevel(entry, difficulty) {
  if (!entry) return "empty";
  const { total, solved } = getDsaStats(entry, difficulty);
  if (total === 0) return "none";
  const ratio = solved / total;
  if (ratio >= 0.8) return "gold";
  if (ratio >= 0.5) return "green";
  if (ratio > 0) return "blue";
  return "zero";
}

const CELL_CLASS = {
  empty: "contribution-empty",
  none: "dsa-cell-none",
  zero: "contribution-zero",
  blue: "contribution-blue",
  green: "contribution-green",
  gold: "contribution-gold",
};

// Sunday=0…Saturday=6 → Monday-first offset (Mon=0…Sun=6)
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

function DsaHeatmap({ entries, onSelectDate }) {
  const [difficulty, setDifficulty] = useState("All");
  const today = new Date();
  const year = today.getFullYear();
  const { days, startOffset, monthLabels } = buildYearGrid(year);
  const lookup = getHeatmapLookup(entries);

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(yearStart);
  const activeEntries = entries.filter((e) => {
    const d = new Date(`${e.date}T00:00:00`);
    return d >= yearStart && d <= yearEnd;
  });

  const totals = activeEntries.reduce(
    (acc, entry) => {
      const { total, solved } = getDsaStats(entry, difficulty);
      acc.total += total;
      acc.solved += solved;
      return acc;
    },
    { total: 0, solved: 0 },
  );

  const overallRatio = totals.total > 0 ? totals.solved / totals.total : 0;
  const ratioLabel =
    overallRatio >= 0.8 ? "Excellent" : overallRatio >= 0.5 ? "Good" : overallRatio > 0 ? "Improving" : "—";
  const ratioColor =
    overallRatio >= 0.8 ? "text-amber-500" : overallRatio >= 0.5 ? "text-emerald-500" : "text-blue-500";

  const totalCols = Math.ceil((days.length + startOffset) / 7);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="surface-card contribution-card p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mono-label text-xs font-semibold uppercase text-violet-500">DSA Progress</p>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {totals.solved}
            </span>
            <span className="text-sm">/{totals.total} solved</span>
            {totals.total > 0 && (
              <span className={`ml-2 text-sm font-semibold ${ratioColor}`}>
                · {ratioLabel} ({Math.round(overallRatio * 100)}%)
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Each cell shows your solve ratio for that day. Gold ≥ 80% · Green ≥ 50% · Blue &gt; 0%
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-white/10 dark:bg-white/5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                difficulty === d
                  ? `bg-white shadow-sm dark:bg-slate-800 ${DIFF_COLORS[d]}`
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Per-difficulty stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {["Easy", "Medium", "Hard"].map((diff) => {
          const stats = activeEntries.reduce(
            (acc, entry) => {
              const s = getDsaStats(entry, diff);
              acc.total += s.total;
              acc.solved += s.solved;
              return acc;
            },
            { total: 0, solved: 0 },
          );
          const ratio = stats.total > 0 ? stats.solved / stats.total : 0;
          const barColor =
            diff === "Easy" ? "bg-emerald-500" : diff === "Medium" ? "bg-amber-500" : "bg-rose-500";
          const textColor =
            diff === "Easy"
              ? "text-emerald-600 dark:text-emerald-400"
              : diff === "Medium"
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400";

          return (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficulty(diff)}
              className={`rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                difficulty === diff
                  ? "border-slate-300/60 bg-white shadow-sm dark:border-white/15 dark:bg-white/10"
                  : "border-slate-200/60 bg-slate-50/60 dark:border-white/8 dark:bg-white/3"
              }`}
            >
              <p className={`text-xs font-semibold ${textColor}`}>{diff}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">
                {stats.solved}
                <span className="text-xs font-medium text-slate-400">/{stats.total}</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{Math.round(ratio * 100)}% solved</p>
            </button>
          );
        })}
      </div>

      <div className="contribution-scroll overflow-x-auto pb-2">
        <div
          className="contribution-graph"
          style={{ gridTemplateColumns: `repeat(${totalCols}, var(--cell-size))` }}
        >
          {/* Month labels — row 1 */}
          {monthLabels.map(({ col, label }) => (
            <span
              key={label}
              className="contribution-month-label"
              style={{ gridColumn: col, gridRow: 1 }}
            >
              {label}
            </span>
          ))}

          {/* Day cells — rows 2–8 */}
          {days.map((date, i) => {
            const absIdx = i + startOffset;
            const col = Math.floor(absIdx / 7) + 1;
            const row = (absIdx % 7) + 2;
            const dateKey = format(date, "yyyy-MM-dd");
            const entry = lookup.get(dateKey);
            const level = getDsaCellLevel(entry, difficulty);
            const { total, solved } = entry
              ? getDsaStats(entry, difficulty)
              : { total: 0, solved: 0 };

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate?.(dateKey)}
                className={["contribution-cell", CELL_CLASS[level]].join(" ")}
                title={`${format(date, "EEE, MMM d, yyyy")} · ${solved}/${total} ${difficulty} solved`}
                aria-label={`${format(date, "MMM d, yyyy")}, ${solved} of ${total} solved`}
                style={{ gridColumn: col, gridRow: row }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <p>Less</p>
        <div className="flex items-center gap-1.5" aria-label="DSA heatmap legend">
          <span className="contribution-key contribution-empty" title="No log" />
          <span className="contribution-key dsa-cell-none" title="Logged, no DSA" />
          <span className="contribution-key contribution-zero" title="0% solved" />
          <span className="contribution-key contribution-blue" title="> 0% solved" />
          <span className="contribution-key contribution-green" title="≥ 50% solved" />
          <span className="contribution-key contribution-gold" title="≥ 80% solved" />
        </div>
        <p>More</p>
      </div>
    </motion.section>
  );
}

export default DsaHeatmap;
