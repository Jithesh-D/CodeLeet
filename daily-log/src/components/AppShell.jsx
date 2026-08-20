import { createContext, useContext, useEffect } from "react";
import { FiActivity, FiAlertCircle, FiBarChart2, FiHome, FiSettings, FiX } from "react-icons/fi";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import FileGate from "./FileGate";
import useLocalStorage from "../hooks/useLocalStorage";
import useDailyEntries from "../hooks/useDailyEntries";
import { STORAGE_KEYS } from "../utils/storage";

const navigation = [
  { to: "/", label: "Overview", icon: FiHome, end: true },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

export const EntriesContext = createContext(null);

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error("useEntries must be used inside AppShell");
  return ctx;
}

function AppShell() {
  const location = useLocation();
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, "dark");
  const dailyEntries = useDailyEntries();
  const {
    isOpen, isLoading, error, saveError, isSupported,
    openExisting, createNew, closeFile, fileName, lastFileName,
  } = dailyEntries;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const pageTitle =
    navigation.find((item) => item.to === location.pathname)?.label ?? "Daily Log";

  if (!isOpen) {
    return (
      <>
        <div className="pointer-events-none fixed inset-0 aurora-bg" />
        <FileGate
          onOpen={openExisting}
          onCreate={createNew}
          isLoading={isLoading}
          error={error}
          isSupported={isSupported}
          lastFileName={lastFileName}
        />
      </>
    );
  }

  return (
    <EntriesContext.Provider value={dailyEntries}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 aurora-bg" />
        <div className="pointer-events-none absolute left-[7%] top-[-9rem] h-80 w-80 rounded-full bg-cyan-400/15 blur-[110px] dark:bg-cyan-400/10" />
        <div className="pointer-events-none absolute right-[-5rem] top-[16rem] h-96 w-96 rounded-full bg-violet-400/10 blur-[130px] dark:bg-blue-500/10" />

        <div className="relative mx-auto min-h-screen max-w-[1680px] px-3 pb-8 pt-3 sm:px-5 sm:pt-5 lg:px-8">
          <header className="glass-nav sticky top-3 z-30 mx-auto flex max-w-[1600px] items-center justify-between gap-3 rounded-[1.4rem] px-3 py-2.5 sm:px-4">
            <NavLink to="/" className="group flex shrink-0 items-center gap-3 rounded-xl px-1 py-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.35)]">
                <FiActivity className="h-4 w-4" />
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Placement Log
                </span>
                <span className="mono-label block mt-0.5 text-[9px] font-semibold uppercase text-slate-400">
                  Build deliberately
                </span>
              </span>
            </NavLink>

            <nav
              className="flex items-center gap-1 rounded-xl bg-slate-900/[0.035] p-1 dark:bg-white/[0.055]"
              aria-label="Primary navigation"
            >
              {navigation.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all sm:px-3 sm:text-sm",
                      isActive
                        ? "bg-white text-slate-950 shadow-[0_3px_13px_rgba(15,23,42,0.10)] dark:bg-white/[0.13] dark:text-white"
                        : "text-slate-500 hover:bg-white/55 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {fileName && (
                <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 pl-3 pr-1.5 py-1 lg:flex">
                  <span className="max-w-[140px] truncate text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                    {fileName}
                  </span>
                  <button
                    type="button"
                    onClick={closeFile}
                    title="Close file"
                    className="rounded-full p-0.5 text-emerald-500 transition hover:bg-emerald-500/20"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              )}
              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
          </header>

          {/* Persistent save-error banner */}
          {saveError && (
            <div className="mx-auto mt-3 flex max-w-[1600px] items-center gap-3 rounded-2xl border border-rose-300/50 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <FiAlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{saveError}</p>
            </div>
          )}

          <main className="mx-auto max-w-[1600px] py-7 sm:py-9 lg:py-11">
            <div className="mb-6 flex items-center gap-3 px-1 sm:hidden">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              <p className="mono-label text-[10px] font-semibold uppercase text-slate-400">
                {pageTitle}
              </p>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </EntriesContext.Provider>
  );
}

export default AppShell;
