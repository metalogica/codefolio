// Single source of truth for the launcher apps on the desktop.
//
// Two consumers read from here:
//   - AppLayout.tsx       — desktop icon + AppLauncherWindow per app
//   - lib/terminal/vfs.ts — one <id>.txt per app in the terminal

import type { LauncherApp } from "../components/global/AppLauncherWindow";
import type { WindowId } from "../components/global/Taskbar";

export type DesktopLauncherApp = LauncherApp & {
  windowId: WindowId;
  desktopPosition: { x: number; y: number };
};

export const LAUNCHER_APPS: DesktopLauncherApp[] = [
  {
    id: "soulbound",
    windowId: "soulbound",
    name: "Soulbound Labs",
    exeName: "SOULBOUND.EXE",
    screenshotUrl: "/soulbound-labs.png",
    blurb: "An AI Native Studio",
    url: "https://soulboundlabs.com",
    desktopPosition: { x: 340, y: 180 },
  },
];
