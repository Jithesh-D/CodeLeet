import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  HABIT_OPTIONS,
  MOOD_OPTIONS,
  createEmptyEntry,
  createFormState,
  normalizeEntry,
} from "../../utils/storage";
import ScorePicker from "../ScorePicker/ScorePicker";

function DayModal({ isOpen, initialEntry, onClose, onSave }) {
  const [formState, setFormState] = useState(() =>
    createFormState(initialEntry ?? createEmptyEntry()),
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function updateField(field, value) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function toggleHabit(habit) {
    setFormState((currentState) => {
      const hasHabit = currentState.habits.includes(habit);

      return {
        ...currentState,
        habits: hasHabit
          ? currentState.habits.filter((item) => item !== habit)
          : [...currentState.habits, habit],
      };
    });
  }

  function addDsaQuestion(difficulty) {
    setFormState((currentState) => ({
      ...currentState,
      dsaQuestions: [
        ...currentState.dsaQuestions,
        {
          difficulty,
          solved: false,
          bruteForce: false,
          note: "",
          timeMinutes: "",
        },
      ],
    }));
  }

  function updateDsaQuestion(index, field, value) {
    setFormState((currentState) => ({
      ...currentState,
      dsaQuestions: currentState.dsaQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  function removeDsaQuestion(index) {
    setFormState((currentState) => ({
      ...currentState,
      dsaQuestions: currentState.dsaQuestions.filter(
        (_, questionIndex) => questionIndex !== index,
      ),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave(
      normalizeEntry({
        ...formState,
        score: Number(formState.score),
        studyHours: Number(formState.studyHours || 0),
        sleepHours: Number(formState.sleepHours || 0),
        instagramMinutes: Number(formState.instagramMinutes || 0),
        dsaQuestions: formState.dsaQuestions.map((question) => ({
          ...question,
          timeMinutes: Number(question.timeMinutes || 0),
        })),
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_120px_rgba(15,23,42,0.24)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-white/10 sm:px-6">
              <div>
                <p className="mono-label text-xs font-semibold uppercase text-cyan-500">
                  Daily log
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
                  Log today in under a minute.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Everything saves locally in the browser.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                aria-label="Close daily log"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[78vh] overflow-y-auto px-5 py-6 sm:px-6"
            >
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <ScorePicker
                    label="Daily score"
                    value={Number(formState.score)}
                    onChange={(nextScore) =>
                      updateField("score", String(nextScore))
                    }
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>Mood</span>
                      <select
                        value={formState.mood}
                        onChange={(event) =>
                          updateField("mood", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                      >
                        {MOOD_OPTIONS.map((mood) => (
                          <option key={mood} value={mood}>
                            {mood}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>Bedtime</span>
                      <input
                        type="time"
                        value={formState.bedtime}
                        onChange={(event) =>
                          updateField("bedtime", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>Study hours</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formState.studyHours}
                        onChange={(event) =>
                          updateField("studyHours", event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>Sleep hours</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formState.sleepHours}
                        onChange={(event) =>
                          updateField("sleepHours", event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>Youtube minutes</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formState.instagramMinutes}
                        onChange={(event) =>
                          updateField("instagramMinutes", event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                      />
                    </label>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 p-4 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          DSA questions solved
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Add questions by difficulty, then mark each one
                          solved.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {["Easy", "Medium", "Hard"].map((difficulty) => (
                          <button
                            key={difficulty}
                            type="button"
                            onClick={() => addDsaQuestion(difficulty)}
                            className="rounded-full border border-cyan-300/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500 hover:text-white dark:text-cyan-300"
                          >
                            + {difficulty}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formState.dsaQuestions.length ? (
                      <div className="mt-4 space-y-3">
                        {formState.dsaQuestions.map((question, index) => (
                          <div
                            key={`${question.difficulty}-${index}`}
                            className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  question.difficulty === "Easy"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                    : question.difficulty === "Medium"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                                }`}
                              >
                                {question.difficulty} #
                                {
                                  formState.dsaQuestions.filter(
                                    (item, itemIndex) =>
                                      item.difficulty === question.difficulty &&
                                      itemIndex <= index,
                                  ).length
                                }
                              </span>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={question.solved}
                                    onChange={(event) =>
                                      updateDsaQuestion(
                                        index,
                                        "solved",
                                        event.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  Solved
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={!question.solved}
                                    onChange={(event) =>
                                      updateDsaQuestion(
                                        index,
                                        "solved",
                                        !event.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  Unsolved
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={question.bruteForce}
                                    onChange={(event) =>
                                      updateDsaQuestion(
                                        index,
                                        "bruteForce",
                                        event.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  Brute force
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeDsaQuestion(index)}
                                  className="text-xs font-medium text-slate-400 transition hover:text-rose-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            {question.solved ? (
                              <label className="mt-3 block space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <span>Time taken (minutes)</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={question.timeMinutes}
                                  onChange={(event) =>
                                    updateDsaQuestion(
                                      index,
                                      "timeMinutes",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="e.g. 25"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
                                />
                              </label>
                            ) : null}
                            <label className="mt-3 block space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <span>
                                Note{" "}
                                <span className="font-normal text-slate-400">
                                  ({question.note.length}/20)
                                </span>
                              </span>
                              <input
                                type="text"
                                maxLength="20"
                                value={question.note}
                                onChange={(event) =>
                                  updateDsaQuestion(
                                    index,
                                    "note",
                                    event.target.value,
                                  )
                                }
                                placeholder="Short question note"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        No DSA questions added for this day.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Habits
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {HABIT_OPTIONS.map((habit) => {
                        const isActive = formState.habits.includes(habit);

                        return (
                          <button
                            key={habit}
                            type="button"
                            onClick={() => toggleHabit(habit)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "border-cyan-400/50 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-500/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            }`}
                            aria-pressed={isActive}
                          >
                            {habit}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span>Notes</span>
                    <textarea
                      value={formState.notes}
                      onChange={(event) =>
                        updateField("notes", event.target.value)
                      }
                      rows={9}
                      placeholder="What shaped today?"
                      className="w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-50"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  Save today's log
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default DayModal;
