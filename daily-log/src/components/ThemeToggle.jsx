import { FiMoon, FiSun } from "react-icons/fi";

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-3 rounded-full border border-slate-300/50 bg-white/65 px-4 py-2 text-sm font-medium text-inherit backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/75 dark:border-slate-500/30 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/70 text-current shadow-sm dark:border-white/10 dark:bg-white/10">
        {isDark ? (
          <FiSun className="h-4 w-4" />
        ) : (
          <FiMoon className="h-4 w-4" />
        )}
      </span>
      <span className="mono-label text-xs">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

export default ThemeToggle;
