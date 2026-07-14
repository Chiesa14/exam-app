"use client";

import { useEffect, useState } from "react";
import { getLang, LANG_EVENT } from "./lang";
import type { Lang } from "./types";

/** Current UI language, live-updating whenever LanguageToggle flips it. */
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    setLang(getLang());
    const onChange = (e: Event) => setLang((e as CustomEvent<Lang>).detail);
    window.addEventListener(LANG_EVENT, onChange);
    return () => window.removeEventListener(LANG_EVENT, onChange);
  }, []);
  return lang;
}
