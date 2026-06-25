export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number; // index into options of the correct answer
  image: string | null; // filename in /public/signs, e.g. "img_283.png"
  imageEssential: boolean;
}

/** Aggregated per-question performance, derived from the attempts table. */
export interface QStat {
  qid: number;
  seen: number; // total times presented/answered
  correct: number;
  wrong: number;
  lastResults: number[]; // chronological last-N results (1 correct / 0 wrong)
  lastSeen: number | null; // epoch ms
}

export interface ExamRecord {
  id: number;
  score: number;
  total: number;
  passed: number; // 0/1
  durationMs: number;
  ts: number;
}

export type Mode = "practice" | "exam";

/** A question prepared for display: options shuffled, with mapping back to the original answer. */
export interface PreparedQuestion {
  question: Question;
  shuffledOptions: { text: string; originalIndex: number }[];
  correctShuffledIndex: number;
}
