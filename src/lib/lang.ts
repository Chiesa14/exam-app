"use client";

// Display language for question text: English (source) or Kinyarwanda.
// Persisted the same way as the sound preference (see sound.ts).

import type { Lang } from "./types";

let current: Lang = "en";

export const LANG_EVENT = "lang-change";

export function setLang(v: Lang) {
  current = v;
  if (typeof window !== "undefined") {
    localStorage.setItem("lang", v);
    // localStorage's own "storage" event doesn't fire in the tab that made the change,
    // so broadcast one explicitly for same-tab listeners (e.g. QuestionView) to react to.
    window.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: v }));
  }
}

export function getLang(): Lang {
  if (typeof window === "undefined") return current;
  const v = localStorage.getItem("lang");
  current = v === "rw" ? "rw" : "en";
  return current;
}
