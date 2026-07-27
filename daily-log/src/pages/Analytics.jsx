import { useMemo } from "react";
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
  getMetricSummary,
  getRecentEntries,
} from "../utils/analytics";

function Analytics() {
  const { entries } = useEntries();

  const recentEntries = useMemo(() => getRecentEntries(entries, 60), [entries]);
  const dailySeries = useMemo(() => buildDailySeries(recentEntries), [recentEntries]);
  const weeklyScoreSeries = useMemo(() => buildWeeklyScoreSeries(recentEntries), [recentEntries]);
  const summary = useMemo(() => getMetricSummary(entries), [entries]);

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

        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/70 px-4 py-2 text-sm text-slate-600 backdrop-blur dark:bg-white/5 dark:text-slate-300">
          {entries.length} tracked days
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Avg score" value={`${summary.avgScore}/10`} detail="All-time" />
        <StatsCard label="Avg study" value={`${summary.avgStudyHours}h`} detail="Per logged day" accent="emerald" />
        <StatsCard label="Avg sleep" value={`${summary.avgSleepHours}h`} detail="Per logged day" accent="amber" />
        <StatsCard label="Avg Instagram" value={`${summary.avgInstagramMinutes}m`} detail="Per logged day" accent="rose" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
      </div>
    </section>
  );
}

export default Analytics;
