import type { Question, QStat, PreparedQuestion } from "./types";

export interface SelectOpts {
  /** Questions with exposures <= minExposure + window are eligible. Smaller = stricter coverage. */
  exposureWindow?: number;
  /** Multiplier applied to the recent-wrong rate. Higher = failed questions recur more. */
  failBoost?: number;
  /** Question ids to avoid re-picking (e.g. the last few shown this session). */
  exclude?: Set<number>;
}

function metrics(q: Question, stats: Map<number, QStat>) {
  const s = stats.get(q.id);
  const exposures = s?.seen ?? 0;
  const recentWrong =
    s && s.lastResults.length ? 1 - s.lastResults.reduce((a, b) => a + b, 0) / s.lastResults.length : 0;
  const neverSeen = !s || s.seen === 0;
  const last3 = s ? s.lastResults.slice(-3) : [];
  const mastered = last3.length >= 3 && last3.every((x) => x === 1);
  return { exposures, recentWrong, neverSeen, mastered };
}

/** Priority weight: failed & unseen boosted, mastered suppressed, lower exposure preferred. */
function weightOf(q: Question, stats: Map<number, QStat>, minExp: number, failBoost: number): number {
  const m = metrics(q, stats);
  let w = 1 + failBoost * m.recentWrong + (m.neverSeen ? 2 : 0) - (m.mastered ? 0.6 : 0);
  w *= 1 / (1 + (m.exposures - minExp) * 0.4);
  return w < 0.1 ? 0.1 : w;
}

/**
 * Pick `n` distinct questions.
 *  - A sliding exposure window guarantees broad coverage: a question is not shown
 *    far more often than the rest before the others have caught up.
 *  - Within the eligible pool, failed / never-seen questions are weighted up so the
 *    tricky ones keep coming back, while consistently-correct ones fade out.
 *  - Weighted sampling without replacement (Efraimidis–Spirakis) keeps it random.
 */
export function pickQuestions(
  all: Question[],
  stats: Map<number, QStat>,
  n: number,
  opts: SelectOpts = {}
): Question[] {
  const window = opts.exposureWindow ?? 1;
  const failBoost = opts.failBoost ?? 3.5;
  const exposureOf = (q: Question) => stats.get(q.id)?.seen ?? 0;

  let candidates = opts.exclude ? all.filter((q) => !opts.exclude!.has(q.id)) : all.slice();
  if (candidates.length < n) candidates = all.slice();

  const minExp = candidates.reduce((m, q) => Math.min(m, exposureOf(q)), Infinity);
  let pool = candidates.filter((q) => exposureOf(q) <= minExp + window);
  if (pool.length < n) pool = candidates; // widen if the low-exposure tier is too small

  const keyed = pool.map((q) => {
    const w = weightOf(q, stats, minExp, failBoost);
    return { q, key: Math.pow(Math.random(), 1 / w) };
  });
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, n).map((k) => k.q);
}

/** Pick a single next question for continuous practice, avoiding the recently shown ones. */
export function pickOne(all: Question[], stats: Map<number, QStat>, recent: number[]): Question {
  const exclude = new Set(recent.slice(-Math.min(recent.length, Math.floor(all.length / 2))));
  return pickQuestions(all, stats, 1, { exposureWindow: 2, failBoost: 4, exclude })[0];
}

/** Shuffle the answer options so position can't be memorised; track the new correct index. */
export function prepareQuestion(q: Question): PreparedQuestion {
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const shuffledOptions = idx.map((originalIndex) => ({ text: q.options[originalIndex], originalIndex }));
  const correctShuffledIndex = idx.indexOf(q.answer);
  return { question: q, shuffledOptions, correctShuffledIndex };
}

/** Questions ranked by how much they need work (for the dashboard). */
export function weakQuestions(all: Question[], stats: Map<number, QStat>, limit = 20): { q: Question; stat: QStat }[] {
  const rows: { q: Question; stat: QStat; score: number }[] = [];
  for (const q of all) {
    const s = stats.get(q.id);
    if (!s || s.seen === 0) continue;
    const recentWrong = s.lastResults.length ? 1 - s.lastResults.reduce((a, b) => a + b, 0) / s.lastResults.length : 0;
    const score = recentWrong * 10 + s.wrong;
    if (s.wrong > 0 || recentWrong > 0) rows.push({ q, stat: s, score });
  }
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit).map(({ q, stat }) => ({ q, stat }));
}
