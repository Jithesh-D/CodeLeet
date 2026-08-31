import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiEdit3,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import DayModal from "../components/DayModal/DayModal";
import YearHeatmap from "../components/Heatmap/YearHeatmap";
import DsaHeatmap from "../components/Heatmap/DsaHeatmap";
import StatsCard from "../components/StatsCard/StatsCard";
import TrendCard from "../components/TrendCard/TrendCard";
import { useEntries } from "../components/AppShell";
import {
  buildDailySeries,
  buildWeeklyScoreSeries,
  getBestDay,
  getMetricSummary,
  getRecentEntries,
  getWeeklyDsaSeries,
} from "../utils/analytics";
import { getStreakMeta, getMissedDays } from "../utils/streak";
import {
  createEmptyEntry,
  getDateKey,
  getSolvedDsaCount,
} from "../utils/storage";
import useLocalStorage from "../hooks/useLocalStorage";

function DailyValueTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
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
  const { entries, getEntryByDate, saveEntry, deleteEntry } = useEntries();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage(
    "daily-log-weekly-dsa-goal",
    15,
  );
  const [goalInput, setGoalInput] = useState(String(weeklyGoal));

  const selectedEntry = useMemo(
    () => getEntryByDate(selectedDate) ?? createEmptyEntry(selectedDate),
    [getEntryByDate, selectedDate],
  );

  const streakMeta = useMemo(() => getStreakMeta(entries), [entries]);
  const metricSummary = useMemo(() => getMetricSummary(entries), [entries]);
  const recentEntries = useMemo(
    () => getRecentEntries(entries, 12).reverse(),
    [entries],
  );
  const dashboardSeries = useMemo(() => buildDailySeries(entries), [entries]);
  const weeklyScoreSeries = useMemo(
    () => buildWeeklyScoreSeries(entries),
    [entries],
  );
  const bestDay = useMemo(() => getBestDay(entries), [entries]);
  const missedDays = useMemo(() => getMissedDays(entries, 14), [entries]);
  const weeklyDsaSeries = useMemo(() => getWeeklyDsaSeries(entries), [entries]);

  const todayDate = getDateKey();
  const hasTodayEntry = entries.some((e) => e.date === todayDate);
  const todayEntry = useMemo(
    () => entries.find((e) => e.date === todayDate),
    [entries, todayDate],
  );

  // This week's DSA solved count
  const thisWeekSolved = useMemo(() => {
    const weekStart = format(
      new Date(
        new Date().setDate(
          new Date().getDate() -
            new Date().getDay() +
            (new Date().getDay() === 0 ? -6 : 1),
        ),
      ),
      "yyyy-MM-dd",
    );
    return entries
      .filter((e) => e.date >= weekStart)
      .reduce((sum, e) => sum + getSolvedDsaCount(e.dsaQuestions), 0);
  }, [entries]);

  const goalProgress = Math.min((thisWeekSolved / weeklyGoal) * 100, 100);

  // Keyboard shortcut: press L to open today's log
  useEffect(() => {
    function handleKey(e) {
      if (isModalOpen) return;
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if (e.key === "l" || e.key === "L") openTodayModal();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen]);

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

  function handleDelete(date) {
    deleteEntry(date);
    setModalOpen(false);
  }

  function handleGoalSave() {
    const val = parseInt(goalInput, 10);
    if (val > 0) setWeeklyGoal(val);
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

      {/* Stats row */}
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

      {/* Today at a glance + Best day + Weekly goal */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today at a glance */}
        <TrendCard
          title="Today at a glance"
          subtitle={format(new Date(), "EEEE, MMM d")}
          rightSlot={<FiZap className="h-5 w-5 text-cyan-500" />}
        >
          {hasTodayEntry && todayEntry ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Score
                </span>
                <span className="text-2xl font-extrabold text-cyan-500">
                  {todayEntry.score}/10
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-slate-50 py-2 dark:bg-white/5">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {todayEntry.studyHours}h
                  </p>
                  <p className="text-[10px] text-slate-400">Study</p>
                </div>
                <div className="rounded-2xl bg-slate-50 py-2 dark:bg-white/5">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {todayEntry.sleepHours}h
                  </p>
                  <p className="text-[10px] text-slate-400">Sleep</p>
                </div>
                <div className="rounded-2xl bg-slate-50 py-2 dark:bg-white/5">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {getSolvedDsaCount(todayEntry.dsaQuestions)}
                  </p>
                  <p className="text-[10px] text-slate-400">DSA</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(todayEntry.habits ?? []).map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-300"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {todayEntry.mood}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No log yet for today.
              </p>
              <button
                type="button"
                onClick={openTodayModal}
                className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-400"
              >
                Log now <span className="ml-1 opacity-60">(L)</span>
              </button>
            </div>
          )}
        </TrendCard>

        {/* Best day */}
        <TrendCard
          title="Best day"
          subtitle="Your highest scored entry"
          rightSlot={<FiTrendingUp className="h-5 w-5 text-amber-500" />}
        >
          {bestDay ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {format(parseISO(bestDay.date), "EEE, MMM d yyyy")}
                </span>
                <span className="text-2xl font-extrabold text-amber-500">
                  {bestDay.score}/10
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-amber-50/60 py-2 dark:bg-amber-500/10">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {bestDay.studyHours}h
                  </p>
                  <p className="text-[10px] text-slate-400">Study</p>
                </div>
                <div className="rounded-2xl bg-amber-50/60 py-2 dark:bg-amber-500/10">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {bestDay.sleepHours}h
                  </p>
                  <p className="text-[10px] text-slate-400">Sleep</p>
                </div>
                <div className="rounded-2xl bg-amber-50/60 py-2 dark:bg-amber-500/10">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {getSolvedDsaCount(bestDay.dsaQuestions)}
                  </p>
                  <p className="text-[10px] text-slate-400">DSA</p>
                </div>
              </div>
              {bestDay.notes ? (
                <p className="text-xs italic text-slate-500 dark:text-slate-400 line-clamp-2">
                  "{bestDay.notes}"
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => openDateModal(bestDay.date)}
                className="text-xs font-semibold text-amber-500 transition hover:text-amber-400"
              >
                View full entry →
              </button>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No entries yet.
            </p>
          )}
        </TrendCard>

        {/* Weekly DSA goal */}
        <TrendCard
          title="Weekly DSA goal"
          subtitle="Problems solved this week"
          rightSlot={<FiTarget className="h-5 w-5 text-violet-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold tracking-tight text-violet-500">
                {thisWeekSolved}
              </span>
              <span className="text-sm text-slate-400">
                / {weeklyGoal} goal
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {goalProgress >= 100
                ? "🎉 Goal reached!"
                : `${weeklyGoal - thisWeekSolved} more to hit your goal`}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
              />
              <button
                type="button"
                onClick={handleGoalSave}
                className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-500 hover:text-white dark:text-violet-300"
              >
                Set goal
              </button>
            </div>
          </div>
        </TrendCard>
      </div>

      {/* Streak calendar — missed days in last 14 */}
      <TrendCard
        title="Streak calendar"
        subtitle="Last 14 days — missed days highlighted"
      >
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const key = format(d, "yyyy-MM-dd");
            const hasEntry = entries.some((e) => e.date === key);
            const isMissed = missedDays.includes(key);
            const isToday = key === todayDate;
            return (
              <button
                key={key}
                type="button"
                onClick={() => openDateModal(key)}
                title={format(d, "EEE, MMM d")}
                className={[
                  "flex flex-col items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5",
                  isToday
                    ? "border-cyan-400/50 bg-cyan-500 text-white shadow-[0_8px_20px_rgba(6,182,212,0.3)]"
                    : hasEntry
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : isMissed
                        ? "border-rose-400/40 bg-rose-500/10 text-rose-500 dark:text-rose-400"
                        : "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5",
                ].join(" ")}
              >
                <span className="text-[10px] font-normal opacity-70">
                  {format(d, "EEE")}
                </span>
                <span>{format(d, "d")}</span>
                <span className="text-[8px]">
                  {hasEntry ? "✓" : isMissed ? "✗" : "·"}
                </span>
              </button>
            );
          })}
        </div>
      </TrendCard>

      <div className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <YearHeatmap entries={entries} onSelectDate={openDateModal} />

        <TrendCard
          title="Recent logs"
          subtitle="Last 12 entries"
          className="h-full"
          rightSlot={
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {entries.length} total
            </span>
          }
        >
          {recentEntries.length ? (
            <div
              className="recent-logs-scroll max-h-[14.75rem] space-y-2 overflow-y-auto pr-1"
              aria-label="Recent logs"
            >
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

      {/* Weekly DSA bar chart */}
      <TrendCard
        title="Weekly DSA solved"
        subtitle="Problems solved per week"
        rightSlot={
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
            goal: {weeklyGoal}/wk
          </span>
        }
      >
        <div className="h-48 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-violet-50/80 to-white p-2 dark:border-white/10 dark:from-violet-500/10 dark:to-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyDsaSeries}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="currentColor"
                opacity={0.1}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                minTickGap={20}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                content={<DailyValueTooltip unit=" solved" />}
                cursor={{ fill: "rgb(134, 239, 172, 0.1)" }}
              />
              <Bar dataKey="solved" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TrendCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <TrendCard
          title="Study rhythm"
          subtitle="Study hours across all logged days"
          rightSlot={
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              {metricSummary.avgStudyHours}h avg
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
                  content={<DailyValueTooltip unit="h" />}
                  cursor={{
                    stroke: "#EAB308",
                    strokeDasharray: "4 4",
                    opacity: 0.45,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="studyHours"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#EAB308",
                    stroke: "#EAB308",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        <TrendCard
          title="Social scroll"
          subtitle="Keep an eye on daily scroll time"
          rightSlot={
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
              {metricSummary.avgSocialScrollMinutes}m avg
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
                  ticks={[60, 120, 180, 300]}
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
                  dataKey="socialScrollMinutes"
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
              <LineChart
                data={weeklyScoreSeries}
                margin={{ top: 14, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  minTickGap={22}
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
                  content={<DailyValueTooltip unit="/10" />}
                  cursor={{
                    stroke: "#06b6d4",
                    strokeDasharray: "4 4",
                    opacity: 0.45,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#ffffff",
                    stroke: "#06b6d4",
                    strokeWidth: 3,
                  }}
                />
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
        onDelete={selectedDate !== todayDate ? handleDelete : undefined}
      />
    </section>
  );
}

export default Dashboard;
