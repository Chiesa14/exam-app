"use client";

// UI chrome strings (not question content, see data/questions.json for that).
// Keep this small and flat — it's for the handful of static labels around the app.

export const UI = {
  en: {
    subtitle: "Rwanda licence trainer",
    progress: "Progress",
    heroChip: "🇷🇼 Provisional driving licence · theory",
    heroTitle1: "Get exam-ready,",
    heroTitle2: "one question at a time.",
    heroDesc: (total: number, pass: number) => (
      <>
        {total} official questions. Smart repetition keeps the ones you miss coming back until you nail them.
        Target: <b className="text-white">{pass}/20</b>.
      </>
    ),
    readiness: "Readiness",
    statSeen: "Seen",
    statAccuracy: "Accuracy",
    statMastered: "Mastered",
    statBest: "Best score",
    practiceTitle: "Practice mode",
    practiceDesc: "One question at a time with instant feedback. Missed questions resurface more often.",
    practiceCta: "Start practising",
    examTitle: "Exam mode",
    examDesc: (count: number, minutes: number, pass: number) =>
      `${count} random questions · ${minutes} min · pass at ${pass}/20. Just like the real test.`,
    examCta: "Take a mock exam",
    viewProgress: "View full progress & weak spots →",
    loadingDb: "loading database…",
    dbError: "Could not load local database:",
  },
  rw: {
    subtitle: "Kwitoza ku ruhushya rw'u Rwanda",
    progress: "Aho ugeze",
    heroChip: "🇷🇼 Uruhushya rw'agateganyo · amategeko y'umuhanda",
    heroTitle1: "Witegure ikizamini,",
    heroTitle2: "ikibazo kimwe ku kindi.",
    heroDesc: (total: number, pass: number) => (
      <>
        Ibibazo {total} by'umwuga. Ibibazo wibeshyeho bigaruka kenshi kugeza ubimenye neza. Intego:{" "}
        <b className="text-white">{pass}/20</b>.
      </>
    ),
    readiness: "Ubwiteguro",
    statSeen: "Wabonye",
    statAccuracy: "Ukuri",
    statMastered: "Wamenye",
    statBest: "Amanota meza",
    practiceTitle: "Kwitoza",
    practiceDesc: "Ikibazo kimwe ku kindi hamwe n'igisubizo cyihuse. Ibibazo wibeshyeho bigaruka kenshi.",
    practiceCta: "Tangira kwitoza",
    examTitle: "Ikizamini",
    examDesc: (count: number, minutes: number, pass: number) =>
      `Ibibazo ${count} bitoranyijwe · iminota ${minutes} · gutsinda ku manota ${pass}/20. Nk'ikizamini nyakuri.`,
    examCta: "Kora ikizamini",
    viewProgress: "Reba aho ugeze n'aho ukennye →",
    loadingDb: "turimo gutangiza ububiko…",
    dbError: "Ntibyashobotse gutangiza ububiko:",
  },
} as const;
