"use client";

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import type { QStat, ExamRecord, Mode } from "./types";

const STORAGE_KEY = "provisoire_db_v1";
const LAST_N = 6; // window of recent results used for prioritisation

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let ready: Promise<void> | null = null;

/* ---------------- base64 helpers for persisting the binary DB ---------------- */
function toB64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qid INTEGER NOT NULL,
  mode TEXT NOT NULL,
  correct INTEGER NOT NULL,
  chosen INTEGER,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_qid ON attempts(qid);
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  ts INTEGER NOT NULL
);
`;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 250);
}
function persistNow() {
  if (!db) return;
  try {
    const data = db.export();
    localStorage.setItem(STORAGE_KEY, toB64(data));
  } catch (e) {
    // localStorage may be unavailable (private mode) — fail silently
    console.warn("persist failed", e);
  }
}

export function initDB(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    // sql.js may request either "sql-wasm.wasm" or "sql-wasm-browser.wasm" depending
    // on the build; both are byte-identical, so always serve the canonical one.
    SQL = await initSqlJs({ locateFile: () => `/sql-wasm/sql-wasm.wasm` });
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        db = new SQL.Database(fromB64(stored));
        db.run(SCHEMA); // ensure tables (no-op if present)
      } catch {
        db = new SQL.Database();
        db.run(SCHEMA);
      }
    } else {
      db = new SQL.Database();
      db.run(SCHEMA);
    }
  })();
  return ready;
}

function need(): Database {
  if (!db) throw new Error("DB not initialised — call initDB() first");
  return db;
}

/* ----------------------------- writes ----------------------------- */
export function recordAttempt(qid: number, mode: Mode, correct: boolean, chosen: number | null) {
  const d = need();
  d.run("INSERT INTO attempts (qid, mode, correct, chosen, ts) VALUES (?,?,?,?,?)", [
    qid,
    mode,
    correct ? 1 : 0,
    chosen,
    Date.now(),
  ]);
  schedulePersist();
}

export function recordExam(score: number, total: number, passed: boolean, durationMs: number) {
  const d = need();
  d.run("INSERT INTO exams (score, total, passed, duration_ms, ts) VALUES (?,?,?,?,?)", [
    score,
    total,
    passed ? 1 : 0,
    Math.round(durationMs),
    Date.now(),
  ]);
  schedulePersist();
}

export function resetAll() {
  const d = need();
  // Drop & recreate is robust whether or not rows / sqlite_sequence exist yet.
  d.run("DROP TABLE IF EXISTS attempts; DROP TABLE IF EXISTS exams;");
  d.run(SCHEMA);
  persistNow();
}

/* ----------------------------- reads ----------------------------- */
interface AttemptRow {
  qid: number;
  correct: number;
  ts: number;
}

function allAttempts(): AttemptRow[] {
  const d = need();
  const res = d.exec("SELECT qid, correct, ts FROM attempts ORDER BY ts ASC, id ASC");
  if (!res.length) return [];
  return res[0].values.map((r) => ({ qid: Number(r[0]), correct: Number(r[1]), ts: Number(r[2]) }));
}

/** Aggregate every question's performance into a Map keyed by qid. */
export function getStats(): Map<number, QStat> {
  const map = new Map<number, QStat>();
  for (const a of allAttempts()) {
    let s = map.get(a.qid);
    if (!s) {
      s = { qid: a.qid, seen: 0, correct: 0, wrong: 0, lastResults: [], lastSeen: null };
      map.set(a.qid, s);
    }
    s.seen += 1;
    if (a.correct) s.correct += 1;
    else s.wrong += 1;
    s.lastResults.push(a.correct);
    if (s.lastResults.length > LAST_N) s.lastResults.shift();
    s.lastSeen = a.ts;
  }
  return map;
}

export interface Totals {
  attempts: number;
  correct: number;
  accuracy: number;
  distinctSeen: number;
  examsTaken: number;
  examsPassed: number;
  bestScore: number;
  avgScore: number;
}

export function getTotals(totalQuestions: number): Totals {
  const d = need();
  const a = d.exec("SELECT COUNT(*), COALESCE(SUM(correct),0), COUNT(DISTINCT qid) FROM attempts");
  const e = d.exec(
    "SELECT COUNT(*), COALESCE(SUM(passed),0), COALESCE(MAX(score),0), COALESCE(AVG(score),0) FROM exams"
  );
  const attempts = a.length ? Number(a[0].values[0][0]) : 0;
  const correct = a.length ? Number(a[0].values[0][1]) : 0;
  const distinctSeen = a.length ? Number(a[0].values[0][2]) : 0;
  const examsTaken = e.length ? Number(e[0].values[0][0]) : 0;
  const examsPassed = e.length ? Number(e[0].values[0][1]) : 0;
  const bestScore = e.length ? Number(e[0].values[0][2]) : 0;
  const avgScore = e.length ? Number(e[0].values[0][3]) : 0;
  void totalQuestions;
  return {
    attempts,
    correct,
    accuracy: attempts ? correct / attempts : 0,
    distinctSeen,
    examsTaken,
    examsPassed,
    bestScore,
    avgScore,
  };
}

export function getExams(limit = 50): ExamRecord[] {
  const d = need();
  const res = d.exec(`SELECT id, score, total, passed, duration_ms, ts FROM exams ORDER BY ts DESC LIMIT ${limit}`);
  if (!res.length) return [];
  return res[0].values.map((r) => ({
    id: Number(r[0]),
    score: Number(r[1]),
    total: Number(r[2]),
    passed: Number(r[3]),
    durationMs: Number(r[4]),
    ts: Number(r[5]),
  }));
}
