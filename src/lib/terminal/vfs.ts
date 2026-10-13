// The terminal's virtual filesystem: a flat home directory whose files mirror
// the website. Every file renders from the content modules, so the terminal
// can never drift from the windows that show the same content.

import { IDENTITY, bioAsPlainText } from "../../content/bio";
import {
  CALENDLY_URL,
  CONTACT_EMAIL,
  GITHUB_URL,
  SOCIAL_LINKS,
} from "../../content/socials";
import { LAUNCHER_APPS } from "../../content/apps";
import type { EventName } from "../analytics";

export const HOME = "/home/guest";

// Spellings of the home directory itself (ls/cat treat these as the directory).
const HOME_ALIASES = new Set([".", "./", "~", "~/", HOME, `${HOME}/`]);

// Prefixes that all resolve into the home directory.
const PATH_PREFIX = /^(\.\/|~\/|\/home\/guest\/)/;

const SOCIALS_LABEL_WIDTH = 11;

export interface VirtualFile {
  name: string;
  read: () => string | Promise<string>;
  /** Conversion event fired when the file is opened (seo-doctrine §2). */
  event?: EventName;
}

function aboutText(): string {
  return [
    `${IDENTITY.name.toUpperCase()} — ${IDENTITY.role}`,
    IDENTITY.studio,
    `${IDENTITY.location} · ${IDENTITY.github}`,
    "",
    bioAsPlainText(),
  ].join("\n");
}

function socialsText(): string {
  const rows: Array<[string, string]> = [
    ["GitHub", GITHUB_URL],
    ...SOCIAL_LINKS.map((social): [string, string] => [social.name, social.url]),
    ["Email", CONTACT_EMAIL],
    ["Book a call", CALENDLY_URL],
  ];
  return rows
    .map(([label, value]) => `${label.padEnd(SOCIALS_LABEL_WIDTH)} ${value}`)
    .join("\n");
}

async function cvText(): Promise<string> {
  const [{ default: html }, { cvHtmlToText }] = await Promise.all([
    import("../../cv/cv.html?raw"),
    import("./cv-text"),
  ]);
  return cvHtmlToText(html);
}

export const VIRTUAL_FILES: VirtualFile[] = [
  { name: "about.txt", read: aboutText },
  { name: "cv.txt", read: cvText, event: "cv_open" },
  { name: "socials.txt", read: socialsText },
  ...LAUNCHER_APPS.map(
    (app): VirtualFile => ({
      name: `${app.id}.txt`,
      read: () => [app.name, app.blurb, "", app.url].join("\n"),
    }),
  ),
];

export function isHomeDirectory(path: string): boolean {
  return HOME_ALIASES.has(path);
}

/** Resolve a path argument to a file. Case-insensitive, like the completer. */
export function resolveFile(path: string): VirtualFile | undefined {
  const name = path.replace(PATH_PREFIX, "").toLowerCase();
  return VIRTUAL_FILES.find((file) => file.name === name);
}
