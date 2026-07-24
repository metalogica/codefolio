import RetroWindow from "./RetroWindow";

const DESKTOP_SIZE = { width: 460, height: 420 };

export interface LauncherApp {
  id: string;
  name: string;
  exeName: string;
  screenshotUrl: string;
  blurb: string;
  url: string;
}

interface AppLauncherWindowProps {
  app: LauncherApp;
  desktopPosition: { x: number; y: number };
  onClose: () => void;
}

export default function AppLauncherWindow({
  app,
  desktopPosition,
  onClose,
}: AppLauncherWindowProps) {
  return (
    <RetroWindow
      title={`A:\\REI\\${app.exeName}`}
      onClose={onClose}
      desktopPosition={desktopPosition}
      desktopSize={DESKTOP_SIZE}
    >
      <div className="p-4 h-full flex flex-col items-center gap-3 text-black font-bitmap overflow-y-auto">
        <img
          src={app.screenshotUrl}
          alt={`${app.name} preview`}
          className="w-full max-h-56 object-contain pixelated border border-black bg-black"
        />
        <p className="text-sm text-center">{app.blurb}</p>
        <button
          type="button"
          onClick={() => window.open(app.url, "_blank", "noopener")}
          className="mt-auto px-4 py-2 bevel-out active:bevel-in bg-pc98-face text-black font-bitmap text-sm cursor-pointer"
        >
          ▶ RUN {app.exeName}
        </button>
      </div>
    </RetroWindow>
  );
}
