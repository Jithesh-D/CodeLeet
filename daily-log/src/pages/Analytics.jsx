import { useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatsCard from "../components/StatsCard/StatsCard";
import TrendCard from "../components/TrendCard/TrendCard";
import { useEntries } from "../components/AppShell";
import {
  buildDailySeries,
  buildWeeklyScoreSeries,
  exportToCsv,
  getMetricSummary,
  getMoodSeries,
  getRecentEntries,
  getStudySleepSeries,
} from "../utils/analytics";

const MOOD_LABELS = { 5: "Focused", 4: "Balanced", 3: "Calm", 2: "Tired", 1: "Stressed" };

function MoodTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-50">
        {MOOD_LABELS[payload[0].value] ?? payload[0].value}
      </p>
    </div>
  );
}

function DualTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-1 text-sm font-bold" style={{ color: p.stroke }}>
          {p.name}: {p.value}h
        </p>
      ))}
    </div>
  );
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function Analytics() {
  const { entries } = useEntries();

  const recentEntries = useMemo(() => getRecentEntries(entries, 60), [entries]);
  const dailySeries = useMemo(() => buildDailySeries(recentEntries), [recentEntries]);
  const weeklyScoreSeries = useMemo(() => buildWeeklyScoreSeries(recentEntries), [recentEntries]);
  const moodSeries = useMemo(() => getMoodSeries(recentEntries), [recentEntries]);
  const studySleepSeries = useMemo(() => getStudySleepSeries(recentEntries), [recentEntries]);
  const summary = useMemo(() => getMetricSummary(entries), [entries]);

  function handleCsvExport() {
    const csv = exportToCsv(entries);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `daily-log-${today}.csv`, "text/csv");
  }

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono-label text-xs font-semibold uppercase text-cyan-500">Analytics</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            Clarity from your daily signals.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Charts rendered directly from your local log file.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/70 px-4 py-2 text-sm text-slate-600 backdrop-blur dark:bg-white/5 dark:text-slate-300">
            {entries.length} tracked days
          </span>
          <button
            type="button"
            onClick={handleCsvExport}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            <FiDownload className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Avg score" value={`${summary.avgScore}/10`} detail="All-time" index={0} />
        <StatsCard label="Avg study" value={`${summary.avgStudyHours}h`} detail="Per logged day" accent="emerald" index={1} />
        <StatsCard label="Avg sleep" value={`${summary.avgSleepHours}h`} detail="Per logged day" accent="amber" index={2} />
        <StatsCard label="Avg social scroll" value={`${summary.avgSocialScrollMinutes}m`} detail="Per logged day" accent="rose" index={3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Score trend */}
        <TrendCard title="Score trend" subtitle="Last 60 entries">
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={28} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        {/* Weekly score average */}
        <TrendCard title="Weekly score average" subtitle="Week-over-week quality">
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyScoreSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} minTickGap={18} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="averageScore" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        {/* Mood trend */}
        <TrendCard
          title="Mood trend"
          subtitle="How your mood has shifted over time"
          rightSlot={
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">
              5 = Focused · 1 = Stressed
            </span>
          }
        >
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-violet-50/60 to-white p-2 dark:border-white/10 dark:from-violet-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={28} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} width={28} />
                <Tooltip content={<MoodTooltip />} />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#ffffff", stroke: "#8b5cf6", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>

        {/* Study vs Sleep correlation */}
        <TrendCard
          title="Study vs Sleep"
          subtitle="See how sleep affects your study output"
          rightSlot={
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-emerald-500" />Study</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-blue-500" />Sleep</span>
            </div>
          }
        >
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-emerald-50/40 to-white p-2 dark:border-white/10 dark:from-emerald-500/10 dark:to-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studySleepSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={28} />
                <YAxis domain={[0, 12]} ticks={[2, 4, 6, 8, 10, 12]} tick={{ fontSize: 12 }} width={28} />
                <Tooltip content={<DualTooltip />} />
                <Line type="monotone" dataKey="studyHours" name="Study" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="sleepHours" name="Sleep" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TrendCard>
      </div>
    </section>
  );
}

export default Analytics;
