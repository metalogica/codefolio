import { useEffect, useRef, useState } from "react";

export const BOOT_DONE_KEY = "pc98-boot-done";

// Total boot budget is ~1.5s, short enough that the sequence reads as flavour
// rather than a wait and nobody feels they have to click through it. The three
// delays below are what spend that budget, so changing one means re-checking
// the sum:
//
//   7 lines  x BOOT_LINE_DELAY_MS   =  980ms
//   7 steps  x MEMORY_STEP_DELAY_MS =  245ms   (2048..15360 in 2048 increments)
//             FINISH_HOLD_MS        =  250ms
//                                     ------
//                                     1475ms
const BOOT_LINE_DELAY_MS = 140;
const MEMORY_STEP_KB = 2048;
const MEMORY_TOTAL_KB = 15360;
const MEMORY_STEP_DELAY_MS = 35;
const FINISH_HOLD_MS = 250;

const MEMORY_LINE_INDEX = 3;

const bootLines = (memKb: number): string[] => [
  "SOULBOUND LABS REI-9801 PERSONAL COMPUTER",
  "BIOS ROM v5.0  (c) 2026 SOULBOUND LABS",
  "",
  `MEMORY CHECK : 640KB + ${memKb}KB OK`,
  "FDD1: READY   HDD1: REI.GG",
  "BOOT : A:\\REI.SYS ............ OK",
  "LOAD : TERMINAL.EXE",
];

const clearBootCover = () => {
  delete document.documentElement.dataset.boot;
};

export default function BootSequence() {
  const [running, setRunning] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [memKb, setMemKb] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const finishSilently = () => {
      sessionStorage.setItem(BOOT_DONE_KEY, "1");
      clearBootCover();
    };

    if (reducedMotion.matches || sessionStorage.getItem(BOOT_DONE_KEY)) {
      finishSilently();
      return;
    }

    setRunning(true);

    const timeouts = timeoutsRef.current;
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(setTimeout(fn, ms));
    };

    const finish = () => {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
      document.removeEventListener("pointerdown", finish);
      document.removeEventListener("keydown", finish);
      reducedMotion.removeEventListener("change", onMotionChange);
      sessionStorage.setItem(BOOT_DONE_KEY, "1");
      clearBootCover();
      setRunning(false);
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) finish();
    };

    document.addEventListener("pointerdown", finish, { passive: true });
    document.addEventListener("keydown", finish, { passive: true });
    reducedMotion.addEventListener("change", onMotionChange);

    let elapsed = 0;
    const totalLines = bootLines(0).length;
    for (let line = 1; line <= totalLines; line++) {
      elapsed += BOOT_LINE_DELAY_MS;
      schedule(() => setVisibleLines(line), elapsed);

      if (line - 1 === MEMORY_LINE_INDEX) {
        for (let kb = MEMORY_STEP_KB; kb <= MEMORY_TOTAL_KB; kb += MEMORY_STEP_KB) {
          elapsed += MEMORY_STEP_DELAY_MS;
          const value = kb;
          schedule(() => setMemKb(value), elapsed);
        }
      }
    }
    schedule(finish, elapsed + FINISH_HOLD_MS);

    return finish;
  }, []);

  if (!running) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black font-mono text-white text-sm md:text-base">
      <div className="p-6 whitespace-pre-wrap leading-relaxed">
        {bootLines(memKb).slice(0, visibleLines).join("\n")}
      </div>
      <div className="absolute bottom-6 left-6 text-pc98-shadow">
        Press any key to skip
      </div>
    </div>
  );
}
