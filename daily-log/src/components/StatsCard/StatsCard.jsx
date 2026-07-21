function StatsCard({ label, value, detail, accent = "cyan" }) {
  const accentClass =
    accent === "rose"
      ? "text-rose-500"
      : accent === "emerald"
        ? "text-emerald-500"
        : accent === "amber"
          ? "text-amber-500"
          : "text-cyan-500";

  const haloClass =
    accent === "rose"
      ? "from-rose-400/15"
      : accent === "emerald"
        ? "from-emerald-400/15"
        : accent === "amber"
          ? "from-amber-400/15"
          : "from-cyan-400/15";

  return (
    <article className="surface-card group relative overflow-hidden p-5 transition hover:-translate-y-0.5">
      <div
        className={`pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-gradient-to-b ${haloClass} to-transparent blur-2xl`}
      />
      <p className="mono-label text-xs uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 ${accentClass}`}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {detail}
        </p>
      ) : null}
    </article>
  );
}

export default StatsCard;
