import { motion } from "framer-motion";
import { FiFile, FiFolderPlus, FiAlertCircle, FiRefreshCw, FiActivity } from "react-icons/fi";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

function FileGate({ onOpen, onCreate, isLoading, error, isSupported, lastFileName }) {
  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10"
        >
          <FiAlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-50">Browser not supported</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            File System Access API is required. Please use Chrome or Edge 86+.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        className="w-full max-w-lg"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo + heading */}
        <motion.div variants={item} className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_12px_40px_rgba(6,182,212,0.45)]"
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <FiActivity className="h-7 w-7 text-white" />
          </motion.div>
          <p className="mono-label text-xs font-semibold uppercase text-cyan-500">Daily Log</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
            Your data, your file.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            All logs are stored in a <strong>.json</strong> file on your device.
            Nothing is sent to any server.
          </p>
        </motion.div>

        {/* Reopen last file */}
        {lastFileName && (
          <motion.div
            variants={item}
            className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-300/40 bg-cyan-500/8 px-4 py-3 dark:border-cyan-500/20 dark:bg-cyan-500/10"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Continue where you left off</p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{lastFileName}</p>
            </div>
            <motion.button
              type="button"
              onClick={onOpen}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
            >
              <FiRefreshCw className="h-3 w-3" />
              Reopen
            </motion.button>
          </motion.div>
        )}

        {/* Action cards */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={onCreate}
            disabled={isLoading}
            whileHover={{ scale: 1.03, y: -4, boxShadow: "0 28px 70px rgba(6,182,212,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-4 rounded-3xl border border-cyan-500/20 bg-cyan-500 p-8 text-white shadow-[0_20px_60px_rgba(6,182,212,0.3)] disabled:opacity-60"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <FiFolderPlus className="h-8 w-8" />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-bold">New log file</p>
              <p className="mt-1 text-xs text-cyan-100">Start fresh — pick where to save</p>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={onOpen}
            disabled={isLoading}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 p-8 text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <motion.div
              initial={{ rotate: 10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <FiFile className="h-8 w-8" />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-bold">Open existing file</p>
              <p className="mt-1 text-xs text-slate-400">Load a previous daily-log.json</p>
            </div>
          </motion.button>
        </motion.div>

        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            Opening file…
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default FileGate;
