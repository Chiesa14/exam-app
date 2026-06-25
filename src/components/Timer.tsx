"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "./icons";
import { sfx } from "@/lib/sound";

export default function Timer({
  totalSeconds,
  running,
  onExpire,
}: {
  totalSeconds: number;
  running: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expired = useRef(false);
  const warned = useRef<{ [k: number]: boolean }>({});

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 60 && next > 0 && next % 10 === 0 && !warned.current[next]) {
          warned.current[next] = true;
          sfx.warn();
        }
        if (next === 0 && !expired.current) {
          expired.current = true;
          sfx.warn();
          setTimeout(onExpire, 0);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onExpire]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const low = remaining <= 60;
  const pct = (remaining / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold tabular-nums transition-colors ${
          low ? "border-brand-red/60 bg-brand-red/15 text-brand-red animate-pulse" : "border-white/10 bg-white/5 text-slate-100"
        }`}
      >
        <Clock className="h-5 w-5" />
        <span className="text-xl">
          {mm}:{ss.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${low ? "bg-brand-red" : "bg-brand-blue"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
