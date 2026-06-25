"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { sfx } from "@/lib/sound";
import { Trophy, Refresh, Book, Clock, Check, X } from "./icons";

export default function ResultScreen({
  score,
  total,
  pass,
  durationMs,
  onRetry,
  onReview,
  onHome,
}: {
  score: number;
  total: number;
  pass: number;
  durationMs: number;
  onRetry: () => void;
  onReview: () => void;
  onHome: () => void;
}) {
  const passed = score >= pass;
  const pct = Math.round((score / total) * 100);

  useEffect(() => {
    if (passed) {
      sfx.win();
      const end = Date.now() + 900;
      const colors = ["#1eb0ff", "#1fc77d", "#ffd200"];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } else {
      sfx.fail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mins = Math.floor(durationMs / 60000);
  const secs = Math.floor((durationMs % 60000) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden p-7 text-center"
    >
      <div
        className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl ${
          passed ? "bg-brand-green/20 text-brand-green animate-pulse-ring" : "bg-brand-red/20 text-brand-red"
        }`}
      >
        {passed ? <Trophy className="h-9 w-9" /> : <X className="h-9 w-9" />}
      </div>

      <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {passed ? "You passed your target 🎉" : "Keep practising"}
      </div>
      <div className="mt-1 text-6xl font-black tabular-nums">
        {score}
        <span className="text-2xl text-slate-500">/{total}</span>
      </div>
      <div className={`mt-1 text-sm font-medium ${passed ? "text-brand-green" : "text-brand-red"}`}>
        {pct}% · target {pass}/{total}
        {passed ? " reached" : ` — ${pass - score} more needed`}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span className="chip">
          <Clock className="h-3.5 w-3.5" /> {mins}:{secs.toString().padStart(2, "0")}
        </span>
        <span className="chip">
          <Check className="h-3.5 w-3.5 text-brand-green" /> {score} right
        </span>
        <span className="chip">
          <X className="h-3.5 w-3.5 text-brand-red" /> {total - score} wrong
        </span>
      </div>

      <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
        <button className="btn-ghost" onClick={onReview}>
          <Book className="h-4 w-4" /> Review answers
        </button>
        <button className="btn-primary" onClick={onRetry}>
          <Refresh className="h-4 w-4" /> New exam
        </button>
        <button className="btn-ghost" onClick={onHome}>
          Home
        </button>
      </div>
    </motion.div>
  );
}
