import { useEffect } from "react";
import { FiBarChart2, FiCalendar, FiHome, FiSettings } from "react-icons/fi";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import useLocalStorage from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";

const navigation = [
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

function AppShell() {
  const location = useLocation();
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const shellTone =
    theme === "dark"
      ? "border-slate-600/30 bg-slate-950/55 text-slate-100 shadow-[0_28px_100px_rgba(2,6,23,0.45)]"
      : "border-slate-200/85 bg-white/62 text-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.1)]";

  const panelTone =
    theme === "dark"
      ? "border-slate-500/25 bg-white/[0.04] text-slate-200"
      : "border-slate-200/90 bg-white/85 text-slate-900";

  const mobileNavTone =
    theme === "dark"
      ? "border-slate-500/25 bg-slate-950/85 text-slate-200"
      : "border-slate-200/85 bg-white/80 text-slate-700";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_4%,rgba(56,189,248,0.13),transparent_24%),radial-gradient(circle_at_92%_0%,rgba(16,185,129,0.1),transparent_26%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-white/40 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative mx-auto flex min-h-screen max-w-[1500px]">
        <aside
          className={`hidden w-[18.5rem] shrink-0 border-r backdrop-blur-2xl lg:flex lg:flex-col ${shellTone}`}
        >
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-sm font-semibold tracking-[0.3em] text-cyan-500">
              DL
            </div>
            <div>
              <p className="mono-label text-xs font-medium text-slate-400 uppercase">
                Daily Log
              </p>
              <p className="text-xs text-slate-500">
                Personal analytics, locally stored
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                    panelTone,
                    isActive
                      ? "border-cyan-400/45 bg-cyan-500/12 text-cyan-500 shadow-[0_8px_30px_rgba(6,182,212,0.16)]"
                      : "hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-500/7",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4 transition group-hover:scale-110" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 px-4 py-6">
            <div className={`surface-card p-4 ${panelTone}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono-label text-xs uppercase text-slate-500">
                    Storage
                  </p>
                  <p className="mt-2 text-sm font-medium">Local only</p>
                </div>
                <FiCalendar className="h-5 w-5 text-cyan-500" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Every entry stays in the browser. No backend, no sync layer.
              </p>
            </div>

            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:hidden ${mobileNavTone}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mono-label text-xs font-semibold uppercase text-cyan-500">
                  Daily Log
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {location.pathname === "/"
                    ? "Dashboard"
                    : location.pathname.slice(1)}
                </p>
              </div>

              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {navigation.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      "flex min-w-max items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "border-cyan-400/45 bg-cyan-500/12 text-cyan-500"
                        : "border-transparent bg-white/5 text-slate-500 hover:bg-white/45 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
            <div
              key={location.pathname}
              className="rounded-[2rem] border border-white/5 bg-transparent"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
