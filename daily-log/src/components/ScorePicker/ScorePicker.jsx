function ScorePicker({ label, value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <span className="mono-label rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {value}/10
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, index) => {
          const score = index + 1;
          const isActive = value === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`h-11 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500 text-white shadow-[0_10px_28px_rgba(6,182,212,0.3)]"
                  : "border-slate-200 bg-white/85 text-slate-600 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-500/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
              aria-pressed={isActive}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ScorePicker;
