"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SoundToggle from "./SoundToggle";
import { ChevronLeft } from "./icons";

export default function Header({ title, back }: { title?: string; back?: boolean }) {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 mb-6 flex items-center justify-between gap-3 border-b border-white/5 bg-[#070d1b]/70 px-1 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        {back ? (
          <Link href="/" className="btn-ghost !rounded-xl !p-2.5" aria-label="Home">
            <ChevronLeft />
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-green text-lg font-black text-[#06281a]">
              P
            </span>
          </Link>
        )}
        <div className="leading-tight">
          <div className="text-sm font-bold sm:text-base">{title ?? "Provisoire"}</div>
          {!title && <div className="text-[11px] text-slate-400">Rwanda licence trainer</div>}
        </div>
      </div>
      <nav className="flex items-center gap-2">
        {path !== "/stats" && (
          <Link href="/stats" className="hidden text-sm font-medium text-slate-300 hover:text-white sm:block">
            Progress
          </Link>
        )}
        <SoundToggle />
      </nav>
    </header>
  );
}
