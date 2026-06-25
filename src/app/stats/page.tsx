"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useDB } from "@/lib/store";
import { getStats, getTotals, getExams, resetAll } from "@/lib/db";
import { QUESTIONS, TOTAL_QUESTIONS, DEFAULT_PASS } from "@/lib/questions";
import { weakQuestions } from "@/lib/selection";
import { Target, Check, X, Trophy, Refresh, Warn, Fire } from "@/components/icons";
import { sfx } from "@/lib/sound";

export default function StatsPage() {
  const { ready, version, refresh } = useDB();
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const data = useMemo(() => {
    if (!ready) return null;
    const stats = getStats();
    const totals = getTotals(TOTAL_QUESTIONS);
    const exams = getExams(30);
    const weak = weakQuestions(QUESTIONS, stats, 25);
    let mastered = 0;
    stats.forEach((s) => {
      const l3 = s.lastResults.slice(-3);
      if (l3.length >= 3 && l3.every((x) => x === 1)) mastered += 1;
    });
    return { stats, totals, exams, weak, mastered };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, version]);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24">
      <Header title="Your progress" back />

      {!ready && <div className="card p-8 text-center text-slate-400">Loading…</div>}

      {data && (
        <>
          {/* headline grid */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Big label="Questions seen" value={`${data.totals.distinctSeen}`} sub={`of ${TOTAL_QUESTIONS}`} icon={<Target className="h-4 w-4" />} />
            <Big label="Mastered" value={`${data.mastered}`} sub="3+ in a row" icon={<Fire className="h-4 w-4" />} />
            <Big label="Accuracy" value={`${Math.round(data.totals.accuracy * 100)}%`} sub={`${data.totals.correct}/${data.totals.attempts}`} icon={<Check className="h-4 w-4" />} />
            <Big label="Exams passed" value={`${data.totals.examsPassed}`} sub={`of ${data.totals.examsTaken}`} icon={<Trophy className="h-4 w-4" />} />
          </section>

          {/* coverage bar */}
          <section className="card mt-4 p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">Bank coverage</span>
              <span className="text-slate-400">
                {data.totals.distinctSeen}/{TOTAL_QUESTIONS} seen · {data.mastered} mastered
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-brand-green" style={{ width: `${(data.mastered / TOTAL_QUESTIONS) * 100}%` }} />
              <div
                className="h-full bg-brand-blue/70"
                style={{ width: `${((data.totals.distinctSeen - data.mastered) / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand-green" /> mastered</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand-blue/70" /> seen</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/10" /> new</span>
            </div>
          </section>

          {/* exam history */}
          <section className="card mt-4 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-brand-sun" /> Exam history
            </h2>
            {data.exams.length === 0 ? (
              <p className="text-sm text-slate-400">No mock exams yet. Take one to track your scores here.</p>
            ) : (
              <div className="space-y-2">
                {/* mini bar chart */}
                <div className="flex h-24 items-end gap-1.5">
                  {[...data.exams].reverse().slice(-24).map((e) => {
                    const h = (e.score / e.total) * 100;
                    const pass = e.score >= DEFAULT_PASS;
                    return (
                      <div key={e.id} className="group flex flex-1 flex-col items-center justify-end" title={`${e.score}/${e.total}`}>
                        <div
                          className={`w-full rounded-t ${pass ? "bg-brand-green" : "bg-brand-red/70"}`}
                          style={{ height: `${Math.max(6, h)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="grid gap-1.5 pt-1">
                  {data.exams.slice(0, 6).map((e) => {
                    const pass = e.score >= DEFAULT_PASS;
                    return (
                      <div key={e.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className={`grid h-6 w-6 place-items-center rounded-lg ${pass ? "bg-brand-green/20 text-brand-green" : "bg-brand-red/20 text-brand-red"}`}>
                            {pass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                          <b>{e.score}/{e.total}</b>
                          <span className="text-xs text-slate-400">{new Date(e.ts).toLocaleDateString()} {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                        <span className={`text-xs font-medium ${pass ? "text-brand-green" : "text-brand-red"}`}>{pass ? "PASS" : "below 18"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* weak questions */}
          <section className="card mt-4 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Warn className="h-4 w-4 text-brand-red" /> Questions to review ({data.weak.length})
            </h2>
            {data.weak.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing flagged yet — keep practising and your weak spots will show up here.</p>
            ) : (
              <div className="space-y-2">
                {data.weak.map(({ q, stat }) => {
                  const isOpen = open === q.id;
                  return (
                    <div key={q.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                      <button className="flex w-full items-center gap-3 px-3 py-2.5 text-left" onClick={() => setOpen(isOpen ? null : q.id)}>
                        <span className="grid h-7 shrink-0 place-items-center rounded-lg bg-brand-red/15 px-2 text-xs font-bold text-brand-red">
                          {stat.wrong}✗
                        </span>
                        <span className="line-clamp-1 flex-1 text-sm text-slate-200">{q.q}</span>
                        <span className="text-[11px] text-slate-500">
                          {stat.correct}/{stat.seen}
                        </span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-3 py-3">
                            {q.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={`/signs/${q.image}`} alt="" className="sign-img mb-3 max-h-48 w-auto" />
                            )}
                            <p className="mb-2 text-sm font-medium">{q.q}</p>
                            <div className="rounded-lg bg-brand-green/15 px-3 py-2 text-sm text-brand-green">
                              <Check className="mr-1 inline h-4 w-4" />
                              {q.options[q.answer]}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* danger zone */}
          <section className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="text-sm">
              <div className="font-medium text-slate-200">Reset all progress</div>
              <div className="text-xs text-slate-500">Wipe history so a new person can start from zero.</div>
            </div>
            <button className="btn-ghost !border-brand-red/40 !text-brand-red" onClick={() => setConfirmReset(true)}>
              <Refresh className="h-4 w-4" /> Reset
            </button>
          </section>
        </>
      )}

      <AnimatePresence>
        {confirmReset && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmReset(false)}>
            <motion.div className="card w-full max-w-sm p-6 text-center" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-red/20 text-brand-red">
                <Warn />
              </div>
              <h3 className="text-lg font-bold">Erase everything?</h3>
              <p className="mt-1.5 text-sm text-slate-300">All attempts, exam scores and weak-spot tracking will be permanently deleted. This cannot be undone.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
                <button
                  className="btn !bg-brand-red !text-white"
                  onClick={() => {
                    resetAll();
                    refresh();
                    setConfirmReset(false);
                    setOpen(null);
                    sfx.warn();
                  }}
                >
                  Erase all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Big({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="card p-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}
