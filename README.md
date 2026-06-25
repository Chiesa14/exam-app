# Provisoire — Rwanda Provisional Driving Licence Trainer

A polished, offline-friendly study app for the **Rwandan provisional driving licence** theory exam.
398 official questions (English) extracted from the source document — including road-sign, road-marking,
intersection-priority and hazard-photo questions — with two study modes,
spaced-repetition that hammers the questions you keep getting wrong, and full progress tracking
in a real (in-browser) SQLite database.

## Features

- **Practice mode** — one question at a time, instant right/wrong feedback, the correct answer revealed,
  sounds and a running streak. Missed questions resurface more often.
- **Exam mode** — 20 random questions, **15-minute** timer, question navigator, submit & grade.
  Pass target is **18/20** (the real exam passes at 12/20 — you train harder).
- **Smart selection** — every question gets fair coverage (nothing is shown many times before the rest
  appear) while *failed and never-seen* questions are weighted up and *mastered* ones fade out.
- **Source answer order** — options are shown in their original order (kept on purpose, since some
  answers refer to letters like "A and B are correct").
- **Accurate images** — sign / marking / diagram / photo questions show the exact picture from the source.
- **Progress dashboard** — coverage, accuracy, mastered count, exam history chart, and a
  "questions to review" list of your weak spots.
- **Real SQLite** — progress is stored in [sql.js](https://sql.js.org) (SQLite compiled to WebAssembly),
  persisted in your browser. One-click **Reset** wipes everything so a new person can start from zero.
- Works fully client-side — no backend, no account, installable to your home screen.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

This is a standard Next.js app — Vercel auto-detects it.

```bash
npm i -g vercel   # if needed
vercel            # follow the prompts, or push the repo to GitHub and "Import" on vercel.com
```

No environment variables or configuration are required. All data (questions, images, the SQLite wasm)
ships as static assets.

## How the questions were produced

The questions live in `src/data/questions.json` and the images in `public/signs/`.
They were extracted from the official 3-language source PDF: the English column was isolated,
OCR ligature artdefacts were repaired, the correct answer was taken from the source's
parenthesis / green-highlight markers, and every question (and every image) was verified.

## Tech

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion · sql.js (SQLite/WASM) ·
Web Audio (synthesised sounds) · canvas-confetti.
# exam-app
