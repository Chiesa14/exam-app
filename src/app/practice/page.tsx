"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import QuestionView from "@/components/QuestionView";
import { useDB } from "@/lib/store";
import { getStats, recordAttempt } from "@/lib/db";
import { QUESTIONS } from "@/lib/questions";
import { pickOne, prepareQuestion } from "@/lib/selection";
import type { PreparedQuestion } from "@/lib/types";
import { sfx } from "@/lib/sound";
import { Check, X, ChevronRight, Fire, Target } from "@/components/icons";

export default function PracticePage() {
  const { ready, refresh } = useDB();
  const [prepared, setPrepared] = useState<PreparedQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ seen: 0, correct: 0, streak: 0, best: 0 });
  const recent = useRef<number[]>([]);

  const next = useCallback(() => {
    const stats = getStats();
    const q = pickOne(QUESTIONS, stats, recent.current);
    recent.current.push(q.id);
    if (recent.current.length > 60) recent.current.shift();
    setPrepared(prepareQuestion(q));
    setSelected(null);
    setRevealed(false);
  }, []);

  useEffect(() => {
    if (ready && !prepared) next();
  }, [ready, prepared, next]);

  const choose = useCallback(
    (i: number) => {
      if (revealed || !prepared) return;
      setSelected(i);
      setRevealed(true);
      const correct = i === prepared.correctShuffledIndex;
      const chosenOriginal = prepared.shuffledOptions[i].originalIndex;
      recordAttempt(prepared.question.id, "practice", correct, chosenOriginal);
      refresh();
      if (correct) sfx.correct();
      else sfx.wrong();
      setSession((s) => {
        const streak = correct ? s.streak + 1 : 0;
        return { seen: s.seen + 1, correct: s.correct + (correct ? 1 : 0), streak, best: Math.max(s.best, streak) };
      });
    },
    [revealed, prepared, refresh]
  );

  // keyboard: A-D / 1-4 to answer, Enter / Space / N for next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!prepared) return;
      const k = e.key.toLowerCase();
      if (!revealed) {
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4, "1": 0, "2": 1, "3": 2, "4": 3, "5": 4 };
        if (k in map && map[k] < prepared.shuffledOptions.length) {
          e.preventDefault();
          choose(map[k]);
        }
      } else if (k === "enter" || k === " " || k === "n") {
        e.preventDefault();
        sfx.click();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prepared, revealed, choose, next]);

  const correctText = prepared ? prepared.shuffledOptions[prepared.correctShuffledIndex].text : "";
  const wasCorrect = revealed && selected === prepared?.correctShuffledIndex;
  const acc = session.seen ? Math.round((session.correct / session.seen) * 100) : 0;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40">
      <Header title="Practice" back />

      {/* session bar */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <MiniStat icon={<Target className="h-4 w-4" />} label="This session" value={`${session.correct}/${session.seen}`} />
        <MiniStat icon={<Check className="h-4 w-4" />} label="Accuracy" value={`${acc}%`} />
        <MiniStat icon={<Fire className="h-4 w-4" />} label="Streak" value={`${session.streak}`} sub={session.best ? `best ${session.best}` : undefined} />
      </div>

      {!ready && <div className="card p-8 text-center text-slate-400">Loading questions…</div>}

      <AnimatePresence mode="wait">
        {prepared && (
          <QuestionView
            key={prepared.question.id + "-" + session.seen}
            prepared={prepared}
            index={session.seen + (revealed ? 0 : 1)}
            total={QUESTIONS.length}
            selected={selected}
            revealed={revealed}
            onSelect={choose}
            modeLabel="Practice"
          />
        )}
      </AnimatePresence>

      {/* feedback + next (sticky) */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a1426]/90 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                  wasCorrect ? "bg-brand-green/20 text-brand-green" : "bg-brand-red/20 text-brand-red"
                }`}
              >
                {wasCorrect ? <Check /> : <X />}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${wasCorrect ? "text-brand-green" : "text-brand-red"}`}>
                  {wasCorrect ? "Correct!" : "Not quite"}
                </div>
                {!wasCorrect && (
                  <div className="truncate text-xs text-slate-300">
                    Answer: <span className="font-medium text-white">{correctText}</span>
                  </div>
                )}
              </div>
              <button className="btn-primary shrink-0" onClick={() => { sfx.click(); next(); }}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3">
      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}
