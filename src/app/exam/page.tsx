"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import QuestionView from "@/components/QuestionView";
import Timer from "@/components/Timer";
import ResultScreen from "@/components/ResultScreen";
import { useDB } from "@/lib/store";
import { getStats, recordAttempt, recordExam } from "@/lib/db";
import { QUESTIONS, EXAM_COUNT, EXAM_MINUTES, EXAM_SECONDS, DEFAULT_PASS, OFFICIAL_PASS } from "@/lib/questions";
import { pickQuestions, prepareQuestion } from "@/lib/selection";
import type { PreparedQuestion } from "@/lib/types";
import { sfx } from "@/lib/sound";
import { ChevronLeft, ChevronRight, Trophy, Clock, Target, Check, X } from "@/components/icons";

type Phase = "intro" | "running" | "result" | "review";

export default function ExamPage() {
  const { ready, refresh } = useDB();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [exam, setExam] = useState<PreparedQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<{ score: number; durationMs: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const startRef = useRef<number>(0);

  const buildExam = useCallback(() => {
    const stats = getStats();
    const qs = pickQuestions(QUESTIONS, stats, EXAM_COUNT, { exposureWindow: 1, failBoost: 3.5 });
    setExam(qs.map(prepareQuestion));
    setAnswers(Array(qs.length).fill(null));
    setCurrent(0);
    setResult(null);
    setConfirmOpen(false);
    startRef.current = Date.now();
    setPhase("running");
    sfx.click();
  }, []);

  const choose = useCallback(
    (i: number) => {
      setAnswers((prev) => {
        const n = [...prev];
        n[current] = i;
        return n;
      });
      sfx.select();
    },
    [current]
  );

  const submit = useCallback(() => {
    let score = 0;
    exam.forEach((pq, i) => {
      const sel = answers[i];
      const correct = sel !== null && sel === pq.correctShuffledIndex;
      if (correct) score += 1;
      const chosenOriginal = sel !== null ? pq.shuffledOptions[sel].originalIndex : null;
      recordAttempt(pq.question.id, "exam", correct, chosenOriginal);
    });
    const durationMs = Date.now() - startRef.current;
    recordExam(score, exam.length, score >= DEFAULT_PASS, durationMs);
    refresh();
    setResult({ score, durationMs });
    setConfirmOpen(false);
    setPhase("result");
  }, [exam, answers, refresh]);

  // keyboard navigation during exam
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      if (k in map && exam[current] && map[k] < exam[current].shuffledOptions.length) {
        e.preventDefault();
        choose(map[k]);
      } else if (e.key === "ArrowRight") {
        setCurrent((c) => Math.min(exam.length - 1, c + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrent((c) => Math.max(0, c - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, current, exam, choose]);

  const answeredCount = answers.filter((a) => a !== null).length;

  /* ----------------------------- INTRO ----------------------------- */
  if (phase === "intro") {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-20">
        <Header title="Exam mode" back />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-7 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand-green/20 text-brand-green">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Mock exam</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
            {EXAM_COUNT} questions drawn from the full bank, answers shuffled. Beat the clock and hit your target score.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Info icon={<Target className="h-4 w-4" />} k="Questions" v={`${EXAM_COUNT}`} />
            <Info icon={<Clock className="h-4 w-4" />} k="Time" v={`${EXAM_MINUTES} min`} />
            <Info icon={<Trophy className="h-4 w-4" />} k="Pass target" v={`${DEFAULT_PASS}/20`} />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Official pass mark is {OFFICIAL_PASS}/20 — you&apos;re training at the tougher {DEFAULT_PASS}/20.
          </p>
          <button className="btn-primary mt-6 w-full" onClick={buildExam} disabled={!ready}>
            {ready ? "Start exam" : "Loading…"}
          </button>
        </motion.div>
      </main>
    );
  }

  /* ----------------------------- RESULT ----------------------------- */
  if (phase === "result" && result) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-20">
        <Header title="Result" back />
        <ResultScreen
          score={result.score}
          total={exam.length}
          pass={DEFAULT_PASS}
          durationMs={result.durationMs}
          onRetry={buildExam}
          onReview={() => { setPhase("review"); setCurrent(0); }}
          onHome={() => router.push("/")}
        />
      </main>
    );
  }

  /* ----------------------------- REVIEW ----------------------------- */
  if (phase === "review") {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-24">
        <Header title="Review" back />
        <div className="mb-4 flex items-center justify-between">
          <span className="chip">Reviewing your answers</span>
          <button className="btn-primary !py-2" onClick={buildExam}>
            New exam
          </button>
        </div>
        <div className="grid gap-4">
          {exam.map((pq, i) => (
            <QuestionView
              key={pq.question.id}
              prepared={pq}
              index={i + 1}
              total={exam.length}
              selected={answers[i]}
              revealed
              onSelect={() => {}}
              modeLabel={answers[i] === pq.correctShuffledIndex ? "✓" : "✗"}
            />
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button className="btn-ghost flex-1" onClick={() => router.push("/")}>Home</button>
          <button className="btn-primary flex-1" onClick={buildExam}>Take another exam</button>
        </div>
      </main>
    );
  }

  /* ----------------------------- RUNNING ----------------------------- */
  const pq = exam[current];
  return (
    <main className="mx-auto max-w-2xl px-4 pb-28">
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-white/5 bg-[#070d1b]/80 px-4 py-3 backdrop-blur-xl">
        <div>
          <div className="text-sm font-bold">Exam in progress</div>
          <div className="text-[11px] text-slate-400">
            {answeredCount}/{exam.length} answered
          </div>
        </div>
        <Timer totalSeconds={EXAM_SECONDS} running={phase === "running"} onExpire={submit} />
      </div>

      {/* navigator */}
      <div className="mb-4 grid grid-cols-10 gap-1.5">
        {exam.map((_, i) => {
          const answered = answers[i] !== null;
          const isCur = i === current;
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                isCur
                  ? "bg-brand-blue text-white ring-2 ring-brand-blue/50"
                  : answered
                  ? "bg-brand-green/25 text-brand-green"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {pq && (
          <QuestionView
            key={pq.question.id}
            prepared={pq}
            index={current + 1}
            total={exam.length}
            selected={answers[current]}
            revealed={false}
            onSelect={choose}
            modeLabel="Exam"
          />
        )}
      </AnimatePresence>

      {/* nav buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn-ghost"
          disabled={current === 0}
          onClick={() => { setCurrent((c) => Math.max(0, c - 1)); sfx.click(); }}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        {current < exam.length - 1 ? (
          <button className="btn-primary flex-1" onClick={() => { setCurrent((c) => c + 1); sfx.click(); }}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="btn-success flex-1" onClick={() => setConfirmOpen(true)}>
            Submit exam
          </button>
        )}
      </div>
      <button className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-300" onClick={() => setConfirmOpen(true)}>
        Finish &amp; submit now
      </button>

      {/* confirm submit modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              className="card w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold">Submit your exam?</h3>
              <p className="mt-1.5 text-sm text-slate-300">
                {answeredCount === exam.length ? (
                  <>All {exam.length} answered. Ready to see your score?</>
                ) : (
                  <>
                    <span className="font-semibold text-brand-sun">{exam.length - answeredCount}</span> question
                    {exam.length - answeredCount > 1 ? "s" : ""} still unanswered — these count as wrong.
                  </>
                )}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="btn-ghost" onClick={() => setConfirmOpen(false)}>
                  Keep going
                </button>
                <button className="btn-success" onClick={submit}>
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Info({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">{icon}{k}</div>
      <div className="text-lg font-extrabold">{v}</div>
    </div>
  );
}
