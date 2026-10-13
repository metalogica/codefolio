// Command interpreter for the terminal emulator. No React, no DOM: input in,
// result out, so it can be unit-tested without the window around it.

import { trackEvent } from "../analytics";
import { HOME, VIRTUAL_FILES, isHomeDirectory, resolveFile } from "./vfs";

export const COMMAND_NAMES = [
  "cat",
  "clear",
  "help",
  "history",
  "ls",
  "open",
  "pwd",
] as const;

// Commands whose arguments are paths — Tab completes file names after these.
const PATH_COMMANDS = new Set<string>(["cat", "ls", "open"]);

// A path prefix the completer keeps in place while completing the name after it.
const COMPLETION_PATH_PREFIX = /^(\.\/|~\/|\/home\/guest\/)?(.*)$/;

const LS_SEPARATOR = "    ";
const HISTORY_NUMBER_WIDTH = 5;

const HELP_TEXT = `Available commands:
  ls [file]     list files in ${HOME}
  pwd           print the working directory
  cat <file>    print a file (alias: open)
  history [n]   show command history (-c clears it)
  clear         clear the screen
  help          show this message

Tab completes commands and file names; up/down recall history.
Want to talk to me? Open Chat on the desktop.`;

export interface CommandResult {
  output?: string;
  isError?: boolean;
  clear?: boolean;
  /** Set by `history -c`: the caller empties its command history. */
  clearHistory?: boolean;
}

export interface CommandContext {
  /** Every command entered so far, including the one being run (as bash). */
  history: string[];
}

export interface Completion {
  value: string;
  /** Set when Tab is ambiguous: the options to print under the prompt. */
  candidates: string[];
}

export function tokenize(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

function permissionDenied(command: string): CommandResult {
  return {
    output: `${command}: permission denied — guest lacks sysadmin privileges`,
    isError: true,
  };
}

function listFiles(args: string[]): CommandResult {
  const paths = args.filter((arg) => !arg.startsWith("-"));
  const allNames = VIRTUAL_FILES.map((file) => file.name).join(LS_SEPARATOR);
  if (paths.length === 0) return { output: allNames };

  let failures = 0;
  const lines = paths.map((path) => {
    if (isHomeDirectory(path)) return allNames;
    const file = resolveFile(path);
    if (file) return file.name;
    failures += 1;
    return `ls: cannot access '${path}': No such file or directory`;
  });
  return { output: lines.join("\n"), isError: failures === paths.length };
}

function showHistory(args: string[], history: string[]): CommandResult {
  const [option] = args;
  if (option === "-c") return { clearHistory: true };
  if (option?.startsWith("-")) {
    return { output: `history: ${option}: invalid option`, isError: true };
  }

  const count = option === undefined ? history.length : Number(option);
  if (!Number.isInteger(count) || count < 0) {
    return { output: `history: ${option}: numeric argument required`, isError: true };
  }

  const start = Math.max(0, history.length - count);
  const rows = history
    .slice(start)
    .map((cmd, i) => `${String(start + i + 1).padStart(HISTORY_NUMBER_WIDTH)}  ${cmd}`);
  return rows.length > 0 ? { output: rows.join("\n") } : {};
}

async function readFiles(command: string, args: string[]): Promise<CommandResult> {
  if (args.length === 0) {
    return { output: `${command}: missing file operand\nUsage: ${command} <file>`, isError: true };
  }

  let failures = 0;
  const outputs: string[] = [];
  for (const path of args) {
    if (isHomeDirectory(path)) {
      failures += 1;
      outputs.push(`${command}: ${path}: Is a directory`);
      continue;
    }
    const file = resolveFile(path);
    if (!file) {
      failures += 1;
      outputs.push(`${command}: ${path}: No such file or directory`);
      continue;
    }
    try {
      outputs.push(await file.read());
      if (file.event) trackEvent(file.event, { source: "terminal" });
    } catch {
      failures += 1;
      outputs.push(`${command}: ${path}: read error`);
    }
  }
  return { output: outputs.join("\n\n"), isError: failures === args.length };
}

export async function runCommand(
  line: string,
  { history }: CommandContext,
): Promise<CommandResult> {
  const [command, ...args] = tokenize(line);
  if (!command) return {};

  switch (command) {
    case "help":
      return { output: HELP_TEXT };
    case "pwd":
      return { output: HOME };
    case "clear":
      return { clear: true };
    case "history":
      return showHistory(args, history);
    case "ls":
      return listFiles(args);
    case "cat":
    case "open":
      return readFiles(command, args);
    default:
      return permissionDenied(command);
  }
}

function longestCommonPrefix(words: string[]): string {
  return words.reduce((prefix, word) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === word[i]) i += 1;
    return prefix.slice(0, i);
  });
}

// Complete `partial` (the tail of `line`) against `options`, keeping `pathPrefix`.
function completeToken(
  line: string,
  partial: string,
  options: readonly string[],
  pathPrefix = "",
): Completion {
  const needle = partial.toLowerCase();
  const matches = options.filter((option) => option.toLowerCase().startsWith(needle));
  if (matches.length === 0) return { value: line, candidates: [] };

  const head = line.slice(0, line.length - pathPrefix.length - partial.length);
  if (matches.length === 1) {
    return { value: `${head}${pathPrefix}${matches[0]} `, candidates: [] };
  }

  const common = longestCommonPrefix(matches);
  if (common.length > partial.length) {
    return { value: `${head}${pathPrefix}${common}`, candidates: [] };
  }
  return { value: line, candidates: matches };
}

/** Tab completion: command names first, then file names for path commands. */
export function completeInput(line: string): Completion {
  const tokens = tokenize(line);
  const endsWithSpace = /\s$/.test(line);

  if (tokens.length === 0) return { value: line, candidates: [...COMMAND_NAMES] };
  if (tokens.length === 1 && !endsWithSpace) {
    return completeToken(line, tokens[0], COMMAND_NAMES);
  }
  if (!PATH_COMMANDS.has(tokens[0])) return { value: line, candidates: [] };

  const current = endsWithSpace ? "" : tokens[tokens.length - 1];
  const [, pathPrefix = "", partial = ""] = current.match(COMPLETION_PATH_PREFIX) ?? [];
  return completeToken(
    line,
    partial,
    VIRTUAL_FILES.map((file) => file.name),
    pathPrefix,
  );
}
