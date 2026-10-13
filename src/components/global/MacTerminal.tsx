import { useEffect, useLayoutEffect, useRef, useState } from "react";
import RetroWindow from "./RetroWindow";
import { MOBILE_BREAKPOINT, tallMobileLayout } from "./useWindowControls";
import { IDENTITY } from "../../content/bio";
import { CONTACT_EMAIL } from "../../content/socials";
import { completeInput, runCommand } from "../../lib/terminal/commands";
import {
  loadSession,
  saveSession,
  type TerminalLine,
} from "../../lib/terminal/session";

const PROMPT = "guest@rei ~ %";
const CANDIDATE_SEPARATOR = "  ";

const DESKTOP_POSITION = { x: 150, y: 150 };
const DESKTOP_SIZE = { width: 600, height: 400 };

const BANNER = `REI.SYS loaded.

Name: ${IDENTITY.name}
Role: ${IDENTITY.role}
Location: ${IDENTITY.location}

Contact: ${CONTACT_EMAIL}
GitHub: ${IDENTITY.github}

Type 'help' to list commands, or 'ls' to look around.
Want to talk to me? Open Chat on the desktop.
`;

interface MacTerminalProps {
  onClose: () => void;
}

export default function MacTerminal({ onClose }: MacTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "output", text: BANNER },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // False until any saved session is loaded, so the fresh banner can't
  // overwrite it on the first save.
  const [isRestored, setIsRestored] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const linesEndRef = useRef<HTMLDivElement>(null);

  // Restore before first paint so a reopened window never flashes the banner.
  useLayoutEffect(() => {
    const session = loadSession();
    if (session) {
      setLines(session.lines);
      setHistory(session.history);
    }
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isRestored) saveSession({ lines, history });
  }, [isRestored, lines, history]);

  // Focus on open, desktop only — on mobile it would pop the keyboard.
  useEffect(() => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    linesEndRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;

    const line = input;
    const nextHistory = line.trim() ? [...history, line] : history;
    setInput("");
    setHistoryIndex(null);
    setHistory(nextHistory);
    setLines((prev) => [...prev, { kind: "prompt", text: line }]);

    setIsBusy(true);
    const result = await runCommand(line, { history: nextHistory });
    setIsBusy(false);

    if (result.clearHistory) setHistory([]);
    if (result.clear) {
      setLines([]);
    } else if (result.output) {
      const output: TerminalLine = {
        kind: result.isError ? "error" : "output",
        text: result.output,
      };
      setLines((prev) => [...prev, output]);
    }
  };

  const recallHistory = (index: number | null) => {
    setHistoryIndex(index);
    setInput(index === null ? "" : history[index]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { value, candidates } = completeInput(input);
      if (candidates.length > 0) {
        setLines((prev) => [
          ...prev,
          { kind: "prompt", text: input },
          { kind: "output", text: candidates.join(CANDIDATE_SEPARATOR) },
        ]);
      } else {
        setInput(value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      recallHistory(
        historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1),
      );
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      recallHistory(historyIndex + 1 < history.length ? historyIndex + 1 : null);
    }
  };

  // Click-to-focus, but never steal a text selection the visitor is copying.
  const focusInput = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus();
  };

  return (
    <RetroWindow
      title="A:\REI\TERMINAL.EXE"
      variant="terminal"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
      detectUserAgent
      mobileLayout={tallMobileLayout}
    >
      {({ isMobile }) => (
        <div
          className="p-4 text-white font-mono text-xs h-full flex flex-col"
          onClick={focusInput}
        >
          <div className="flex-1 overflow-y-auto">
            {lines.map((line, index) => (
              <pre
                key={index}
                className={`whitespace-pre-wrap break-words mb-1 ${
                  line.kind === "error" ? "text-red-400" : ""
                }`}
              >
                {line.kind === "prompt" && (
                  <span className="text-pc98-green">{PROMPT} </span>
                )}
                {line.text}
              </pre>
            ))}
            <div ref={linesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-2">
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap text-pc98-green">{PROMPT}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Terminal command"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent outline-none text-white"
              />
              {isMobile && (
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-shrink-0 px-3 py-1.5 bevel-out active:bevel-in bg-pc98-face text-black font-bitmap text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ▶
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </RetroWindow>
  );
}
