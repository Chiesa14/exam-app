import data from "@/data/questions.json";
import type { Question } from "./types";

export const QUESTIONS: Question[] = data as Question[];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Exam configuration. */
export const EXAM_COUNT = 20; // questions per exam
export const EXAM_MINUTES = 15; // time limit
export const EXAM_SECONDS = EXAM_MINUTES * 60;
export const OFFICIAL_PASS = 12; // the real provisional-licence pass mark
export const DEFAULT_PASS = 18; // user's stricter preparation target

export function questionById(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
