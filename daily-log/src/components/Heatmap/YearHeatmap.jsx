import { motion } from "framer-motion";
import { eachDayOfInterval, endOfYear, format, getDay, startOfYear } from "date-fns";
import { getHeatmapLevel, getHeatmapLookup } from "../../utils/heatmap";
import { getSolvedDsaCount } from "../../utils/storage";

const CELL_TONES = {
  zero: "contribution-zero",
  red: "contribution-red",
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

  // How many columns to skip before Jan 1 so it lands on the right weekday row
  const startOffset = mondayOffset(start); // 0=Mon … 6=Sun

  // Month label positions: record the column index where each month starts
  const monthLabels = [];
  days.forEach((day, i) => {
    if (day.getDate() === 1) {
      const col = Math.floor((i + startOffset) / 7) + 1; // 1-based grid column
      monthLabels.push({ col, label: format(day, "MMM") });
    }
  });

  return { days, startOffset, monthLabels };
}

function YearHeatmap({ entries, onSelectDate }) {
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
  const solvedTotal = activeEntries.reduce(
    (sum, e) => sum + getSolvedDsaCount(e.dsaQuestions),
    0,
  );

  // Total columns needed = ceil((days.length + startOffset) / 7)
  const totalCols = Math.ceil((days.length + startOffset) / 7);

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
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {solvedTotal}
            </span>{" "}
            DSA submissions in {year}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            January to December · every square is one calendar day · 7 rows fixed.
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Active days:{" "}
            <strong className="text-slate-900 dark:text-slate-100">
              {activeEntries.length}
            </strong>
          </span>
          <span className="hidden sm:inline">
            {format(yearStart, "MMM d, yyyy")} – {format(yearEnd, "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <div className="contribution-scroll overflow-x-auto pb-2">
        {/*
          Single flat grid:
            row 1          → month labels
            rows 2–8 (7)   → Mon … Sun cells
          Each day's column = floor((absoluteIndex + startOffset) / 7) + 1
          Each day's row    = (absoluteIndex + startOffset) % 7 + 2  (offset by 1 for label row)
        */}
        <div
          className="contribution-graph"
          style={{ gridTemplateColumns: `repeat(${totalCols}, var(--cell-size))` }}
        >
          {/* Month labels in row 1 */}
          {monthLabels.map(({ col, label }) => (
            <span
              key={label}
              className="contribution-month-label"
              style={{ gridColumn: col, gridRow: 1 }}
            >
              {label}
            </span>
          ))}

          {/* Day cells in rows 2–8 */}
          {days.map((date, i) => {
            const absIdx = i + startOffset;
            const col = Math.floor(absIdx / 7) + 1;
            const row = (absIdx % 7) + 2; // +2 because row 1 is labels
            const dateKey = format(date, "yyyy-MM-dd");
            const entry = lookup.get(dateKey);
            const level = entry ? getHeatmapLevel(entry) : null;
            const solved = entry ? getSolvedDsaCount(entry.dsaQuestions) : 0;
            const essential = entry?.essentialsStudy?.length
              ? ` · ${entry.essentialsStudy.join(", ")}`
              : "";

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate?.(dateKey)}
                className={[
                  "contribution-cell",
                  level ? CELL_TONES[level] : "contribution-empty",
                ].join(" ")}
                title={`${format(date, "EEE, MMM d, yyyy")} · ${solved} DSA solved${essential}`}
                aria-label={`${format(date, "MMM d, yyyy")}, ${solved} DSA solved`}
                style={{ gridColumn: col, gridRow: row }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <p>Less</p>
        <div className="flex items-center gap-1.5" aria-label="Heatmap legend">
          <span className="contribution-key contribution-empty" title="No log" />
          <span className="contribution-key contribution-zero" title="0 DSA" />
          <span className="contribution-key contribution-red" title="1 DSA" />
          <span className="contribution-key contribution-blue" title="2–3 DSA or + essential" />
          <span className="contribution-key contribution-green" title="4–6 DSA or + essential" />
          <span className="contribution-key contribution-gold" title="7+ DSA or + essential" />
        </div>
        <p>More</p>
      </div>
    </motion.section>
  );
}

export default YearHeatmap;
