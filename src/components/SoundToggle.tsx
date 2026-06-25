"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, sfx } from "@/lib/sound";
import { SoundOn, SoundOff } from "./icons";

export default function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(isSoundEnabled()), []);
  return (
    <button
      aria-label={on ? "Mute sounds" : "Enable sounds"}
      onClick={() => {
        const next = !on;
        setOn(next);
        setSoundEnabled(next);
        if (next) sfx.select();
      }}
      className="btn-ghost !rounded-xl !p-2.5"
      title={on ? "Sound on" : "Sound off"}
    >
      {on ? <SoundOn /> : <SoundOff className="opacity-60" />}
    </button>
  );
}
