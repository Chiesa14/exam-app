"use client";

// Lightweight synthesized sound effects via the Web Audio API.
// No audio files needed — everything is generated on the fly, so it works
// offline and on Vercel with zero assets.

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  if (typeof window !== "undefined") localStorage.setItem("snd", v ? "1" : "0");
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem("snd");
  enabled = v === null ? true : v === "1";
  return enabled;
}

type ToneOpts = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
};

function tone({ freq, dur, type = "sine", gain = 0.18, delay = 0, slideTo }: ToneOpts) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  click() {
    if (!enabled) return;
    tone({ freq: 420, dur: 0.06, type: "triangle", gain: 0.08 });
  },
  select() {
    if (!enabled) return;
    tone({ freq: 560, dur: 0.08, type: "triangle", gain: 0.09 });
  },
  correct() {
    if (!enabled) return;
    tone({ freq: 660, dur: 0.12, type: "sine", gain: 0.16 });
    tone({ freq: 990, dur: 0.18, type: "sine", gain: 0.16, delay: 0.1 });
  },
  wrong() {
    if (!enabled) return;
    tone({ freq: 200, dur: 0.22, type: "sawtooth", gain: 0.12, slideTo: 120 });
  },
  tick() {
    if (!enabled) return;
    tone({ freq: 880, dur: 0.04, type: "square", gain: 0.05 });
  },
  warn() {
    if (!enabled) return;
    tone({ freq: 330, dur: 0.14, type: "square", gain: 0.1 });
  },
  win() {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => tone({ freq: n, dur: 0.28, type: "triangle", gain: 0.16, delay: i * 0.12 }));
  },
  fail() {
    if (!enabled) return;
    const notes = [392, 349.23, 311.13];
    notes.forEach((n, i) => tone({ freq: n, dur: 0.32, type: "sine", gain: 0.14, delay: i * 0.16 }));
  },
};
