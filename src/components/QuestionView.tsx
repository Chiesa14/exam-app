"use client";

import { motion } from "framer-motion";
import type { PreparedQuestion } from "@/lib/types";
import { Check, X, Image as ImageIcon } from "./icons";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionView({
  prepared,
  index,
  total,
  selected,
  revealed,
  onSelect,
  modeLabel,
}: {
  prepared: PreparedQuestion;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  onSelect: (shuffledIndex: number) => void;
  modeLabel?: string;
}) {
  const { question, shuffledOptions, correctShuffledIndex } = prepared;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="card p-5 sm:p-7"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="chip">
          {modeLabel ? `${modeLabel} · ` : ""}Question {index} / {total}
        </span>
        <span className="chip opacity-70">#{question.id}</span>
      </div>

      <h2 className="text-balance text-lg font-semibold leading-snug sm:text-2xl">{question.q}</h2>

      {question.image && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-brand-blue">
            <ImageIcon className="h-4 w-4" /> Look at the image below
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/signs/${question.image}`}
            alt={`Illustration for question ${question.id}`}
            className="sign-img max-h-72 w-auto max-w-full object-contain"
            loading="eager"
          />
        </div>
      )}

      <div className="mt-5 grid gap-2.5">
        {shuffledOptions.map((opt, i) => {
          let cls = "opt";
          let icon: React.ReactNode = null;
          if (revealed) {
            if (i === correctShuffledIndex) {
              cls += " opt-correct";
              icon = <Check className="h-5 w-5 text-brand-green" />;
            } else if (i === selected) {
              cls += " opt-wrong";
              icon = <X className="h-5 w-5 text-brand-red" />;
            } else {
              cls += " opacity-55";
            }
          } else if (i === selected) {
            cls += " opt-selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={revealed}
              onClick={() => onSelect(i)}
            >
              <div className="flex items-center gap-3">
                <span className="opt-letter">{LETTERS[i]}</span>
                <span className="flex-1 text-[15px] leading-snug sm:text-base">{opt.text}</span>
                {icon}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
