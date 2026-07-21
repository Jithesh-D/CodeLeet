import CalendarHeatmap from "react-calendar-heatmap";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  buildHeatmapValues,
  formatHeatmapDate,
  getHeatmapLookup,
  getYearBounds,
} from "../../utils/heatmap";

function YearHeatmap({
  entries,
  year = new Date().getFullYear(),
  onSelectDate,
}) {
  const values = buildHeatmapValues(entries, year);
  const lookup = getHeatmapLookup(entries);
  const { startDate, endDate } = getYearBounds(year);

  function handleClick(value) {
    if (!value?.date) {
      return;
    }

    onSelectDate?.(value.date);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="surface-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Yearly consistency
          </p>
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">
            GitHub-style heatmap
          </h2>
        </div>
        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {year}
        </p>
      </div>

      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          showWeekdayLabels
          classForValue={(value) => {
            if (!value) return "fill-slate-200 dark:fill-slate-800";
            if (value.count === 1) return "fill-cyan-200 dark:fill-cyan-900";
            if (value.count === 2) return "fill-cyan-300 dark:fill-cyan-700";
            if (value.count === 3) return "fill-cyan-400 dark:fill-cyan-600";
            if (value.count === 4) return "fill-cyan-500 dark:fill-cyan-500";
            return "fill-slate-200 dark:fill-slate-800";
          }}
          titleForValue={(value) => {
            if (!value?.date) {
              return "No entry";
            }

            const entry = lookup.get(value.date);

            return `${formatHeatmapDate(value.date)} | Score ${entry?.score ?? 0}/10 | Mood ${entry?.mood ?? "-"}`;
          }}
          onClick={handleClick}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <p>Tap any day to edit.</p>
          <div className="ml-2 flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-200 dark:bg-cyan-900" />
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-300 dark:bg-cyan-700" />
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400 dark:bg-cyan-600" />
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500 dark:bg-cyan-500" />
          </div>
        </div>
        <p>
          {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
        </p>
      </div>
    </motion.div>
  );
}

export default YearHeatmap;
