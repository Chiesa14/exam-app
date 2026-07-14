"use client";

import { useEffect, useState } from "react";
import { getLang, setLang } from "@/lib/lang";
import type { Lang } from "@/lib/types";
import { sfx } from "@/lib/sound";

export default function LanguageToggle() {
  const [lang, setLocalLang] = useState<Lang>("en");
  useEffect(() => setLocalLang(getLang()), []);

  return (
    <button
      aria-label={lang === "en" ? "Switch to Kinyarwanda" : "Hindura ugere ku Cyongereza"}
      onClick={() => {
        const next: Lang = lang === "en" ? "rw" : "en";
        setLocalLang(next);
        setLang(next);
        sfx.click();
      }}
      className="btn-ghost !rounded-xl !px-2.5 !py-2.5 text-xs font-bold tabular-nums"
      title={lang === "en" ? "English" : "Ikinyarwanda"}
    >
      {lang === "en" ? "EN" : "RW"}
    </button>
  );
}
