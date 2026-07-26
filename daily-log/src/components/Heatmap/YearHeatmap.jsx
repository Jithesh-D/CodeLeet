import { motion } from "framer-motion";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { getHeatmapLevel, getHeatmapLookup } from "../../utils/heatmap";
import { getSolvedDsaCount } from "../../utils/storage";

const CELL_TONES = {
  zero: "contribution-zero",
  red: "contribution-red",
  blue: "contribution-blue",
  green: "contribution-green",
  gold: "contribution-gold",
};

function buildCalendarRange(date) {
  const startDate = startOfYear(date);
  const endDate = endOfYear(date);
  const months = Array.from({ length: 12 }, (_, index) => {
    const monthStart = startOfMonth(new Date(date.getFullYear(), index, 1));
    const monthEnd = endOfMonth(monthStart);

    return {
      key: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM"),
      days: eachDayOfInterval({ start: monthStart, end: monthEnd }),
    };
  });

  return { startDate, endDate, months };
}

function YearHeatmap({ entries, onSelectDate }) {
  const today = new Date();
  const { startDate, endDate, months } = buildCalendarRange(today);
  const lookup = getHeatmapLookup(entries);
  const activeEntries = entries.filter((entry) => {
    const date = new Date(`${entry.date}T00:00:00`);
    return date >= startDate && date <= endDate;
  });
  const solvedTotal = activeEntries.reduce((total, entry) => total + getSolvedDsaCount(entry.dsaQuestions), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="surface-card contribution-card p-5 sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{solvedTotal}</span>{" "}
            DSA submissions in the past year
          </p>
          <p className="mt-1 text-xs text-slate-400">January to December. Every square is one calendar day, with each month precisely separated.</p>
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
          <span>Total active days: <strong className="text-slate-900 dark:text-slate-100">{activeEntries.length}</strong></span>
          <span className="hidden sm:inline">{format(startDate, "MMM d, yyyy")} – {format(endDate, "MMM d, yyyy")}</span>
        </div>
      </div>

      <div className="contribution-scroll overflow-x-auto pb-2">
        <div className="contribution-graph">
          {months.map(({ key, label, days }) => (
            <div className="contribution-month" key={key}>
              <span className="contribution-month-label">{label}</span>
              <div className="contribution-days" style={{ "--month-columns": Math.ceil(days.length / 7) }}>
                {days.map((date, dayIndex) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const entry = lookup.get(dateKey);
              const level = entry ? getHeatmapLevel(entry) : null;
              const solved = entry ? getSolvedDsaCount(entry.dsaQuestions) : 0;
              const essential = entry?.essentialsStudy?.length ? ` · ${entry.essentialsStudy.join(", ")}` : "";

              return <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate?.(dateKey)}
                className={["contribution-cell", level ? CELL_TONES[level] : "contribution-empty"].join(" ")}
                title={`${format(date, "EEE, MMM d, yyyy")} · ${solved} DSA solved${essential}`}
                aria-label={`${format(date, "MMM d, yyyy")}, ${solved} DSA solved`}
                style={{ gridColumn: Math.floor(dayIndex / 7) + 1, gridRow: (dayIndex % 7) + 1 }}
              />;
            })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <p>Less</p>
        <div className="flex items-center gap-1.5" aria-label="Heatmap legend">
          <span className="contribution-key contribution-empty" title="No log" />
          <span className="contribution-key contribution-zero" title="0 DSA" />
          <span className="contribution-key contribution-red" title="1 DSA" />
          <span className="contribution-key contribution-blue" title="2 DSA or 1 + essential" />
          <span className="contribution-key contribution-green" title="3 DSA or 2 + essential" />
          <span className="contribution-key contribution-gold" title="4+ DSA or 3+ + essential" />
        </div>
        <p>More</p>
      </div>
    </motion.section>
  );
}

export default YearHeatmap;
