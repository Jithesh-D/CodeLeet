import { motion } from "framer-motion";

function StatsCard({ label, value, detail, accent = "cyan", index = 0 }) {
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
    <motion.article
      className="surface-card group relative overflow-hidden p-5 transition hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-gradient-to-b ${haloClass} to-transparent blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-80`}
      />
      <p className="mono-label text-xs uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <motion.p
        className={`mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 ${accentClass}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: index * 0.07 + 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {value}
      </motion.p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {detail}
        </p>
      ) : null}
    </motion.article>
  );
}

export default StatsCard;
