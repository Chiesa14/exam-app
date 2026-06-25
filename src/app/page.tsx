"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useDB } from "@/lib/store";
import { getStats, getTotals } from "@/lib/db";
import { TOTAL_QUESTIONS, EXAM_COUNT, EXAM_MINUTES, DEFAULT_PASS } from "@/lib/questions";
import { Book, Trophy, Play, Target, Fire, Chart } from "@/components/icons";

export default function Home() {
  const { ready, error, version } = useDB();

  const summary = useMemo(() => {
    if (!ready) return null;
    const stats = getStats();
    const totals = getTotals(TOTAL_QUESTIONS);
    let mastered = 0;
    stats.forEach((s) => {
      const last3 = s.lastResults.slice(-3);
      if (last3.length >= 3 && last3.every((x) => x === 1)) mastered += 1;
    });
    const coverage = totals.distinctSeen / TOTAL_QUESTIONS;
    const masteredPct = mastered / TOTAL_QUESTIONS;
    const passRate = totals.examsTaken ? totals.examsPassed / totals.examsTaken : 0;
    const readiness = Math.round((coverage * 0.35 + masteredPct * 0.45 + passRate * 0.2) * 100);
    return { totals, mastered, coverage, readiness };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, version]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20">
      <Header />

      {error && (
        <div className="card mb-4 border-brand-red/40 p-4 text-sm text-brand-red">
          Could not load local database: {error}
        </div>
      )}

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card relative overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-blue/20 blur-3xl" />
        <span className="chip">🇷🇼 Provisional driving licence · theory</span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          Get exam-ready,
          <br />
          <span className="bg-gradient-to-r from-brand-blue via-brand-green to-brand-sun bg-clip-text text-transparent">
            one question at a time.
          </span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-slate-300 sm:text-base">
          {TOTAL_QUESTIONS} official questions. Smart repetition keeps the ones you miss coming back until you nail
          them. Target: <b className="text-white">{DEFAULT_PASS}/20</b>.
        </p>

        {/* readiness meter */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Readiness
            </span>
            <span className="font-bold text-white">{summary ? `${summary.readiness}%` : "—"}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-green to-brand-sun"
              initial={{ width: 0 }}
              animate={{ width: `${summary?.readiness ?? 0}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.section>

      {/* quick stats */}
      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Chart className="h-4 w-4" />} label="Seen" value={summary ? `${summary.totals.distinctSeen}/${TOTAL_QUESTIONS}` : "—"} />
        <Stat icon={<Target className="h-4 w-4" />} label="Accuracy" value={summary ? `${Math.round(summary.totals.accuracy * 100)}%` : "—"} />
        <Stat icon={<Fire className="h-4 w-4" />} label="Mastered" value={summary ? `${summary.mastered}` : "—"} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="Best score" value={summary ? `${summary.totals.bestScore}/20` : "—"} />
      </section>

      {/* mode cards */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <ModeCard
          href="/practice"
          accent="from-brand-blue/25"
          icon={<Book className="h-6 w-6" />}
          title="Practice mode"
          desc="One question at a time with instant feedback. Missed questions resurface more often."
          cta="Start practising"
        />
        <ModeCard
          href="/exam"
          accent="from-brand-green/25"
          icon={<Trophy className="h-6 w-6" />}
          title="Exam mode"
          desc={`${EXAM_COUNT} random questions · ${EXAM_MINUTES} min · pass at ${DEFAULT_PASS}/20. Just like the real test.`}
          cta="Take a mock exam"
        />
      </section>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/stats" className="text-slate-300 underline-offset-4 hover:text-white hover:underline">
          View full progress & weak spots →
        </Link>
        {!ready && !error && <span className="text-xs text-slate-500">loading database…</span>}
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <div className="stat-num">{value}</div>
    </div>
  );
}

function ModeCard({
  href,
  icon,
  title,
  desc,
  cta,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  accent: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className={`card relative h-full overflow-hidden p-6`}
      >
        <div className={`pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} to-transparent blur-2xl`} />
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-300">{desc}</p>
        <div className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-blue">
          <Play className="h-4 w-4" /> {cta}
        </div>
      </motion.div>
    </Link>
  );
}
