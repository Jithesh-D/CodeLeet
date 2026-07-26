import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { FiArrowUpRight, FiEdit3 } from "react-icons/fi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DayModal from "../components/DayModal/DayModal";
import YearHeatmap from "../components/Heatmap/YearHeatmap";
import DsaHeatmap from "../components/Heatmap/DsaHeatmap";
import StatsCard from "../components/StatsCard/StatsCard";
import TrendCard from "../components/TrendCard/TrendCard";
import useDailyEntries from "../hooks/useDailyEntries";
import {
  buildDailySeries,
  buildWeeklyScoreSeries,
  getMetricSummary,
  getRecentEntries,
} from "../utils/analytics";
import { getStreakMeta } from "../utils/streak";
import { createEmptyEntry, getDateKey } from "../utils/storage";

function DailyValueTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-50">
        {payload[0].value}
        {unit}
      </p>
    </div>
  );
}

function Dashboard() {
  const { entries, getEntryByDate, saveEntry } = useDailyEntries();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateKey());

  const selectedEntry = useMemo(
    () => getEntryByDate(selectedDate) ?? createEmptyEntry(selectedDate),
    [getEntryByDate, selectedDate],
  );

  const streakMeta = useMemo(() => getStreakMeta(entries), [entries]);
  const metricSummary = useMemo(() => getMetricSummary(entries), [entries]);
  const recentEntries = useMemo(
    () => getRecentEntries(entries, 8).reverse(),
    [entries],
  );
  const dashboardSeries = useMemo(
    () => buildDailySeries(entries),
    [entries],
  );
  const weeklyScoreSeries = useMemo(
    () => buildWeeklyScoreSeries(entries),
    [entries],
  );

  const todayDate = getDateKey();
  const hasTodayEntry = entries.some((entry) => entry.date === todayDate);

  function openTodayModal() {
    setSelectedDate(todayDate);
    setModalOpen(true);
  }

  function openDateModal(date) {
    setSelectedDate(date);
    setModalOpen(true);
  }

  function handleSave(entry) {
    saveEntry(entry);
    setModalOpen(false);
  }

  return (
    <section className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-3xl space-y-3">
          <p className="mono-label text-xs font-semibold uppercase text-cyan-500">
            Dashboard
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
            Placement Prep Daily log & Analytics
          </h3>
          <p className="max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base"></p>
        </div>

        <button
          type="button"
          onClick={openTodayModal}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(6,182,212,0.32)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
        >
          {hasTodayEntry ? "Edit today's log" : "Start today's log"}
          <FiArrowUpRight className="h-4 w-4" />
        </button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Current streak"
          value={`${streakMeta.current} days`}
          detail="Consecutive days logged"
          accent="emerald"
        />
        <StatsCard
          label="Longest streak"
          value={`${streakMeta.longest} days`}
          detail="Best run so far"
          accent="amber"
        />
        <StatsCard
          label="Average score"
          value={`${metricSummary.avgScore}/10`}
          detail="Across all entries"
        />
        <StatsCard
          label="Average sleep"
          value={`${metricSummary.avgSleepHours}h`}
          detail="Nightly average"
          accent="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <YearHeatmap entries={entries} onSelectDate={openDateModal} />

        <TrendCard
          title="Recent logs"
          subtitle="Most recent entries"
          rightSlot={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {entries.length} total
            </span>
          }
        >
          {recentEntries.length ? (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <button
                  key={entry.date}
                  type="button"
                  onClick={() => openDateModal(entry.date)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white/80 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-50/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-cyan-500/10"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {format(parseISO(entry.date), "EEE, MMM d")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entry.mood} · {entry.studyHours}h study ·{" "}
                      {entry.sleepHours}h sleep
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                      {entry.score}/10
                    </span>
                    <FiEdit3 className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              No logs yet. Start with today's entry.
            </p>
          )}
        </TrendCard>
      </div>

      <DsaHeatmap entries={entries} onSelectDate={openDateModal} />

      <div className="grid gap-4 xl:grid-cols-4">
        <TrendCard
          title="Study rhythm"
          subtitle="Study and sleep hours across all logged days"
          rightSlot={
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              {metricSummary.avgStudyHours}h avg study
            </span>
          }
        >
          <div className="h-40 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-emerald-50/80 to-white p-2 dark:border-white/10 dark:from-emerald-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardSeries}
                margin={{ top: 14, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                  axisLine={{ stroke: "currentColor", opacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[2, 4, 6, 8, 10]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={<DailyValueTooltip unit="h studied" />}
                  cursor={{
                    stroke: "#10b981",
                    strokeDasharray: "4 4",
                    opacity: 0.45,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="studyHours"
                  name="Study time"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#ffffff",
                    stroke: "#10b981",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        <TrendCard
          title="Instagram minutes"
          subtitle="Keep an eye on daily scroll time"
          rightSlot={
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
              {metricSummary.avgInstagramMinutes}m avg
            </span>
          }
        >
          <div className="h-40 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-rose-50/80 to-white p-2 dark:border-white/10 dark:from-rose-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardSeries}
                margin={{ top: 14, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                  axisLine={{ stroke: "currentColor", opacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 300]}
                  ticks={[30, 60, 90, 120, 180, 300]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  content={<DailyValueTooltip unit=" min" />}
                  cursor={{
                    stroke: "#fb7185",
                    strokeDasharray: "4 4",
                    opacity: 0.45,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="instagramMinutes"
                  name="Instagram minutes"
                  stroke="#fb7185"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#ffffff",
                    stroke: "#fb7185",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        <TrendCard
          title="Weekly score"
          subtitle="Your weekly average across all logs"
          rightSlot={
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
              {metricSummary.avgScore}/10 avg
            </span>
          }
        >
          <div className="h-40 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-cyan-50/80 to-white p-2 dark:border-white/10 dark:from-cyan-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyScoreSeries} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} minTickGap={22} axisLine={{ stroke: "currentColor", opacity: 0.2 }} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<DailyValueTooltip unit="/10" />} cursor={{ stroke: "#06b6d4", strokeDasharray: "4 4", opacity: 0.45 }} />
                <Line type="monotone" dataKey="averageScore" name="Weekly score" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#ffffff", stroke: "#06b6d4", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        <TrendCard
          title="Score trend"
          subtitle="Daily score across all logs"
          rightSlot={
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
              {metricSummary.avgScore}/10 avg
            </span>
          }
        >
          <div className="h-40 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-violet-50/80 to-white p-2 dark:border-white/10 dark:from-violet-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardSeries} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} minTickGap={22} axisLine={{ stroke: "currentColor", opacity: 0.2 }} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<DailyValueTooltip unit="/10" />} cursor={{ stroke: "#8b5cf6", strokeDasharray: "4 4", opacity: 0.45 }} />
                <Line type="monotone" dataKey="score" name="Daily score" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#ffffff", stroke: "#8b5cf6", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>
      </div>

      <DayModal
        key={selectedDate}
        isOpen={isModalOpen}
        initialEntry={selectedEntry}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </section>
  );
}

export default Dashboard;
