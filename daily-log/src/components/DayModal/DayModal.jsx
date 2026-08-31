import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiClock, FiRefreshCw, FiTrash2, FiX, FiZap } from "react-icons/fi";
import {
  HABIT_OPTIONS,
  ESSENTIAL_STUDY_OPTIONS,
  REVISION_OPTIONS,
  MOOD_OPTIONS,
  createEmptyEntry,
  createFormState,
  normalizeEntry,
  getCalculatedScore,
} from "../../utils/storage";

const MOOD_EMOJI = { Balanced: "😐", Focused: "🎯", Calm: "😌", Tired: "😴", Stressed: "😤" };

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      <p className="mono-label text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {children}
      </p>
    </div>
  );
}

function DayModal({ isOpen, initialEntry, onClose, onSave, onDelete }) {
  const [formState, setFormState] = useState(() =>
    createFormState(initialEntry ?? createEmptyEntry()),
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const liveScore = useMemo(
    () => getCalculatedScore(formState.dsaQuestions, formState.essentialsStudy, formState.revision),
    [formState.dsaQuestions, formState.essentialsStudy, formState.revision],
  );

  const scoreColor =
    liveScore >= 9 ? "text-amber-500" : liveScore >= 7 ? "text-emerald-500" : liveScore >= 5 ? "text-cyan-500" : "text-slate-400";
  const scoreBarColor =
    liveScore >= 9 ? "bg-amber-500" : liveScore >= 7 ? "bg-emerald-500" : liveScore >= 5 ? "bg-cyan-500" : "bg-slate-300";

  function updateField(field, value) {
    setFormState((s) => ({ ...s, [field]: value }));
  }

  function toggleHabit(habit) {
    setFormState((s) => ({
      ...s,
      habits: s.habits.includes(habit) ? s.habits.filter((h) => h !== habit) : [...s.habits, habit],
    }));
  }

  function toggleEssential(topic) {
    setFormState((s) => ({
      ...s,
      essentialsStudy: s.essentialsStudy.includes(topic)
        ? s.essentialsStudy.filter((t) => t !== topic)
        : [...s.essentialsStudy, topic],
    }));
  }

  function toggleRevision(topic) {
    setFormState((s) => ({
      ...s,
      revision: s.revision.includes(topic)
        ? s.revision.filter((t) => t !== topic)
        : [...s.revision, topic],
    }));
  }

  function addDsaQuestion(difficulty) {
    setFormState((s) => ({
      ...s,
      dsaQuestions: [
        ...s.dsaQuestions,
        { difficulty, solved: false, bruteForce: false, learntNew: false, note: "", timeMinutes: "" },
      ],
    }));
  }

  function updateDsaQuestion(index, field, value) {
    setFormState((s) => ({
      ...s,
      dsaQuestions: s.dsaQuestions.map((q, i) => {
        if (i !== index) return q;
        const updated = { ...q, [field]: value };
        if (field === "solved") {
          if (value) updated.bruteForce = false;
          else updated.timeMinutes = "";
        }
        return updated;
      }),
    }));
  }

  function removeDsaQuestion(index) {
    setFormState((s) => ({
      ...s,
      dsaQuestions: s.dsaQuestions.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(
      normalizeEntry({
        ...formState,
        studyHours: Number(formState.studyHours || 0),
        sleepHours: Number(formState.sleepHours || 0),
        socialScrollMinutes: Number(formState.socialScrollMinutes || 0),
        dsaQuestions: formState.dsaQuestions.map((q) => ({
          ...q,
          timeMinutes: Number(q.timeMinutes || 0),
        })),
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  const inputCls = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50 dark:focus:bg-white/8";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-3 py-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_40px_130px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950"
            initial={{ y: 28, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-white/8">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_6px_18px_rgba(6,182,212,0.35)]">
                  <FiZap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="mono-label text-[10px] font-semibold uppercase tracking-widest text-cyan-500">Daily log · {formState.date}</p>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                    Log today's progress
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[82vh] overflow-y-auto">
              <div className="grid lg:grid-cols-[1fr_320px]">

                {/* ── LEFT COLUMN ── */}
                <div className="space-y-6 border-r border-slate-100 px-6 py-6 dark:border-white/8">

                  {/* Row 1: Mood + Bedtime */}
                  <div>
                    <SectionLabel icon={FiClock}>Mood & Sleep</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {/* Mood */}
                      <div className="col-span-2 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mood</p>
                        <div className="flex gap-1.5">
                          {MOOD_OPTIONS.map((mood) => (
                            <button
                              key={mood}
                              type="button"
                              onClick={() => updateField("mood", mood)}
                              title={mood}
                              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 text-xs font-medium transition-all ${
                                formState.mood === mood
                                  ? "border-cyan-400/50 bg-cyan-500 text-white shadow-[0_6px_18px_rgba(6,182,212,0.28)]"
                                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-300/50 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                              }`}
                            >
                              <span className="text-base leading-none">{MOOD_EMOJI[mood]}</span>
                              <span className="hidden sm:block">{mood}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bedtime */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bedtime</p>
                        <input
                          type="time"
                          value={formState.bedtime}
                          onChange={(e) => updateField("bedtime", e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      {/* Sleep hours */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sleep (hrs)</p>
                        <input
                          type="number" min="0" step="0.5"
                          value={formState.sleepHours}
                          onChange={(e) => updateField("sleepHours", e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Study + Social scroll */}
                  <div>
                    <SectionLabel icon={FiBookOpen}>Study & Screen time</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Study hours</p>
                        <input
                          type="number" min="0" step="0.5"
                          value={formState.studyHours}
                          onChange={(e) => updateField("studyHours", e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Social scroll (min)</p>
                        <input
                          type="number" min="0" step="1"
                          value={formState.socialScrollMinutes}
                          onChange={(e) => updateField("socialScrollMinutes", e.target.value)}
                          placeholder="0"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DSA Questions */}
                  <div>
                    <div className="flex items-center justify-between">
                      <SectionLabel icon={FiZap}>DSA Questions</SectionLabel>
                      <div className="flex gap-1.5">
                        {["Easy", "Medium", "Hard"].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => addDsaQuestion(d)}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:-translate-y-0.5 ${
                              d === "Easy"
                                ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-300"
                                : d === "Medium"
                                  ? "border-amber-300/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white dark:text-amber-300"
                                  : "border-rose-300/50 bg-rose-500/10 text-rose-700 hover:bg-rose-500 hover:text-white dark:text-rose-300"
                            }`}
                          >
                            + {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formState.dsaQuestions.length ? (
                      <div className="mt-3 space-y-2">
                        {formState.dsaQuestions.map((q, index) => {
                          const diffNum = formState.dsaQuestions.filter((x, xi) => x.difficulty === q.difficulty && xi <= index).length;
                          const diffColor =
                            q.difficulty === "Easy"
                              ? { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", border: "border-emerald-200/60 dark:border-emerald-500/20" }
                              : q.difficulty === "Medium"
                                ? { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300", border: "border-amber-200/60 dark:border-amber-500/20" }
                                : { badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300", border: "border-rose-200/60 dark:border-rose-500/20" };

                          return (
                            <div key={`${q.difficulty}-${index}`} className={`rounded-2xl border bg-slate-50/80 p-3 dark:bg-white/5 ${diffColor.border}`}>
                              {/* Top row: badge + toggles + remove */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${diffColor.badge}`}>
                                  {q.difficulty} #{diffNum}
                                </span>

                                {/* Solved / Unsolved toggle */}
                                <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                                  <button
                                    type="button"
                                    onClick={() => updateDsaQuestion(index, "solved", true)}
                                    className={`px-3 py-1.5 text-[11px] font-semibold transition ${
                                      q.solved
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-400"
                                    }`}
                                  >
                                    ✓ Solved
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateDsaQuestion(index, "solved", false)}
                                    className={`border-l border-slate-200 px-3 py-1.5 text-[11px] font-semibold transition dark:border-white/10 ${
                                      !q.solved
                                        ? "bg-rose-500 text-white"
                                        : "bg-white text-slate-500 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-400"
                                    }`}
                                  >
                                    ✗ Unsolved
                                  </button>
                                </div>

                                {/* Brute force toggle — only when unsolved */}
                                {!q.solved && (
                                  <button
                                    type="button"
                                    onClick={() => updateDsaQuestion(index, "bruteForce", !q.bruteForce)}
                                    className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition ${
                                      q.bruteForce
                                        ? "border-amber-400/50 bg-amber-500 text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-amber-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                                    }`}
                                  >
                                    Brute force
                                  </button>
                                )}

                                {/* Learnt new toggle */}
                                <button
                                  type="button"
                                  onClick={() => updateDsaQuestion(index, "learntNew", !q.learntNew)}
                                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition ${
                                    q.learntNew
                                      ? "border-violet-400/50 bg-violet-500 text-white"
                                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                                  }`}
                                >
                                  Learnt new
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeDsaQuestion(index)}
                                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-500/10"
                                >
                                  <FiTrash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Bottom row: time + note */}
                              <div className="mt-2.5 grid grid-cols-2 gap-2">
                                {q.solved && (
                                  <input
                                    type="number" min="0" step="1"
                                    value={q.timeMinutes}
                                    onChange={(e) => updateDsaQuestion(index, "timeMinutes", e.target.value)}
                                    placeholder="Time (min)"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
                                  />
                                )}
                                <input
                                  type="text" maxLength="20"
                                  value={q.note}
                                  onChange={(e) => updateDsaQuestion(index, "note", e.target.value)}
                                  placeholder={`Note (${q.note.length}/20)`}
                                  className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 ${q.solved ? "" : "col-span-2"}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-400 dark:border-white/10 dark:bg-white/3">
                        No questions yet — add by difficulty above.
                      </p>
                    )}
                  </div>

                  {/* Essential study */}
                  <div>
                    <SectionLabel icon={FiBookOpen}>Essential study</SectionLabel>
                    <p className="mb-3 text-xs text-slate-400">Topics studied today · each adds +1 to score (max +2)</p>
                    <div className="flex flex-wrap gap-2">
                      {ESSENTIAL_STUDY_OPTIONS.map((topic) => {
                        const on = formState.essentialsStudy.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleEssential(topic)}
                            aria-pressed={on}
                            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                              on
                                ? "border-amber-400/50 bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            }`}
                          >
                            {topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Revision */}
                  <div>
                    <SectionLabel icon={FiRefreshCw}>Revision</SectionLabel>
                    <p className="mb-3 text-xs text-slate-400">Topics revised today · each adds +1 to score (max +2)</p>
                    <div className="flex flex-wrap gap-2">
                      {REVISION_OPTIONS.map((topic) => {
                        const on = formState.revision.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleRevision(topic)}
                            aria-pressed={on}
                            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                              on
                                ? "border-violet-400/50 bg-violet-500 text-white shadow-md shadow-violet-500/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            }`}
                          >
                            {topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="flex flex-col gap-5 px-5 py-6">

                  {/* Live score */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/4">
                    <p className="mono-label text-[10px] font-semibold uppercase tracking-widest text-slate-400">Score preview</p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className={`text-6xl font-extrabold leading-none tracking-tight ${scoreColor}`}>
                        {liveScore}
                      </span>
                      <span className="mb-1 text-xl font-medium text-slate-300 dark:text-slate-600">/10</span>
                    </div>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < liveScore ? scoreBarColor : "bg-slate-200 dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {liveScore === 0 ? "Add DSA or topics to earn score" : liveScore >= 9 ? "Excellent day 🔥" : liveScore >= 7 ? "Great work 💪" : "Keep going ⚡"}
                    </p>
                  </div>

                  {/* Habits */}
                  <div>
                    <p className="mono-label mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Habits</p>
                    <div className="grid grid-cols-2 gap-2">
                      {HABIT_OPTIONS.map((habit) => {
                        const on = formState.habits.includes(habit);
                        return (
                          <button
                            key={habit}
                            type="button"
                            onClick={() => toggleHabit(habit)}
                            aria-pressed={on}
                            className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${
                              on
                                ? "border-cyan-400/50 bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-300/50 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            }`}
                          >
                            {habit}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-1 flex-col">
                    <p className="mono-label mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Notes</p>
                    <textarea
                      value={formState.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      rows={6}
                      placeholder="What shaped today?"
                      className="w-full flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                    />
                    <p className="mt-1.5 text-right text-[10px] text-slate-300 dark:text-slate-600">
                      {formState.notes.length}/500
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-white/8">
                <div>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this entry? This cannot be undone.")) onDelete(formState.date);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-500 hover:text-white dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full border border-cyan-500/20 bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(6,182,212,0.32)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    Save log
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default DayModal;
