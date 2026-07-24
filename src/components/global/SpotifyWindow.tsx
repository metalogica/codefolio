import RetroWindow from "./RetroWindow";

const DESKTOP_POSITION = { x: 300, y: 100 };
const DESKTOP_SIZE = { width: 400, height: 500 };
const MOBILE_HEIGHT = 450;
const MOBILE_EDGE_PADDING = 10;
const MOBILE_TOP_OFFSET = 100;

// Any Spotify playlist, album, or track: https://open.spotify.com/embed/[type]/[id]
const SPOTIFY_EMBED_URL =
  "https://open.spotify.com/embed/playlist/6jo6Plvkdg1BpaWqrBVEwK";

interface SpotifyWindowProps {
  onClose: () => void;
}

export default function SpotifyWindow({ onClose }: SpotifyWindowProps) {
  return (
    <RetroWindow
      title="A:\REI\SPOTIFY.EXE"
      variant="terminal"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
      mobileLayout={(viewportWidth) => ({
        position: { x: MOBILE_EDGE_PADDING, y: MOBILE_TOP_OFFSET },
        size: {
          width: viewportWidth - MOBILE_EDGE_PADDING * 2,
          height: MOBILE_HEIGHT,
        },
      })}
    >
      <div className="w-full h-full flex items-center justify-center p-2">
        <iframe
          src={SPOTIFY_EMBED_URL}
          title="Spotify player"
          width="100%"
          height="100%"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: "none" }}
        />
      </div>
    </RetroWindow>
  );
}
