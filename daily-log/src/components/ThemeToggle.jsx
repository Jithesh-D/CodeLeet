import { FiMoon, FiSun } from "react-icons/fi";

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/50 bg-white/65 text-sm font-medium text-inherit backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/75 dark:border-slate-500/30 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/[0.04] text-current dark:bg-white/[0.08]">
        {isDark ? (
          <FiSun className="h-4 w-4" />
        ) : (
          <FiMoon className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
