// Terminal session persistence: the screen (scrollback) and command history
// survive closing/reopening the window and page reloads for the life of the
// tab, via sessionStorage. Browser-only — call from effects, never in render.
// Storage can be unavailable (private mode, blocked site data), so every
// access is guarded and a bad read just means "no session".

export interface TerminalLine {
  kind: "prompt" | "output" | "error";
  text: string;
}

export interface TerminalSession {
  lines: TerminalLine[];
  history: string[];
}

const STORAGE_KEY = "rei.terminal.session";

// Caps keep a long session from growing storage without bound.
const MAX_LINES = 500;
const MAX_HISTORY = 200;

const LINE_KINDS = new Set<string>(["prompt", "output", "error"]);

function isTerminalLine(value: unknown): value is TerminalLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return typeof line.text === "string" && LINE_KINDS.has(line.kind as string);
}

export function loadSession(): TerminalSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { lines, history } = parsed as Record<string, unknown>;
    if (!Array.isArray(lines) || !lines.every(isTerminalLine)) return null;
    if (!Array.isArray(history) || !history.every((cmd) => typeof cmd === "string")) {
      return null;
    }
    return { lines, history };
  } catch {
    return null;
  }
}

export function saveSession({ lines, history }: TerminalSession): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lines: lines.slice(-MAX_LINES),
        history: history.slice(-MAX_HISTORY),
      }),
    );
  } catch {
    // Storage full or blocked: the session just won't survive a reopen.
  }
}
