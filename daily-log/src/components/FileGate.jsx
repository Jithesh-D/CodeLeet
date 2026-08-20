import { motion } from "framer-motion";
import { FiFile, FiFolderPlus, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

function FileGate({ onOpen, onCreate, isLoading, error, isSupported, lastFileName }) {
  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
          <FiAlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-50">
            Browser not supported
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            File System Access API is required. Please use Chrome or Edge 86+.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <p className="mono-label text-xs font-semibold uppercase text-cyan-500">
            Daily Log
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
            Your data, your file.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            All logs are stored in a <strong>.json</strong> file on your device.
            Nothing is sent to any server.
          </p>
        </div>

        {/* Reopen last file prompt shown after a page refresh */}
        {lastFileName && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-300/40 bg-cyan-500/8 px-4 py-3 dark:border-cyan-500/20 dark:bg-cyan-500/10"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                Continue where you left off
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {lastFileName}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpen}
              disabled={isLoading}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
            >
              <FiRefreshCw className="h-3 w-3" />
              Reopen
            </button>
          </motion.div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCreate}
            disabled={isLoading}
            className="flex flex-col items-center gap-4 rounded-3xl border border-cyan-500/20 bg-cyan-500 p-8 text-white shadow-[0_20px_60px_rgba(6,182,212,0.3)] transition hover:-translate-y-1 hover:bg-cyan-400 disabled:opacity-60"
          >
            <FiFolderPlus className="h-8 w-8" />
            <div className="text-center">
              <p className="text-base font-bold">New log file</p>
              <p className="mt-1 text-xs text-cyan-100">Start fresh — pick where to save</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpen}
            disabled={isLoading}
            className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 p-8 text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FiFile className="h-8 w-8" />
            <div className="text-center">
              <p className="text-base font-bold">Open existing file</p>
              <p className="mt-1 text-xs text-slate-400">Load a previous daily-log.json</p>
            </div>
          </button>
        </div>

        {isLoading && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Opening file…
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default FileGate;
