import { useState, useRef, useEffect } from "react";
import { FaSpotify } from "react-icons/fa";

interface SpotifyWindowProps {
  onClose: () => void;
}

export default function SpotifyWindow({ onClose }: SpotifyWindowProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const [_isResizing, setIsResizing] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Default Spotify embed URL - You can change this to any Spotify playlist, album, or track
  // Format: https://open.spotify.com/embed/[type]/[id]
  const defaultSpotifyEmbed = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Adjust position and size for mobile
      if (mobile) {
        setPosition({ x: 10, y: 100 });
        setDimensions({ width: window.innerWidth - 20, height: 450 });
      } else {
        setPosition({ x: 300, y: 100 });
        setDimensions({ width: 400, height: 500 });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      const startX = e.pageX - position.x;
      const startY = e.pageY - position.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        setPosition({
          x: moveEvent.pageX - startX,
          y: moveEvent.pageY - startY,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Disable dragging on mobile for better UX
    if (dragRef.current && e.touches.length === 1 && !isMobile) {
      e.preventDefault();
      const touch = e.touches[0];
      const startX = touch.pageX - position.x;
      const startY = touch.pageY - position.y;

      const onTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          setPosition({
            x: moveTouch.pageX - startX,
            y: moveTouch.pageY - startY,
          });
        }
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(
        352,
        startHeight + (moveEvent.clientY - startY)
      );

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const startTouchResize = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.touches.length === 1) {
      setIsResizing(true);
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startWidth = dimensions.width;
      const startHeight = dimensions.height;

      const onTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          const newWidth = Math.max(
            300,
            startWidth + (moveTouch.clientX - startX)
          );
          const newHeight = Math.max(
            352,
            startHeight + (moveTouch.clientY - startY)
          );

          setDimensions({
            width: newWidth,
            height: newHeight,
          });
        }
      };

      const onTouchEnd = () => {
        setIsResizing(false);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }
  };

  return (
    <div className="absolute" style={{ left: position.x, top: position.y }}>
      <div
        ref={windowRef}
        className="relative shadow-lg"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className={`bg-gray-800 h-6 flex items-center space-x-2 px-4 ${
            !isMobile ? "cursor-move touch-none" : ""
          } select-none`}
          style={{
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            ...(!isMobile && { touchAction: "none" }),
          }}
        >
          <div
            className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          ></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2">
            <FaSpotify size={14} className="text-green-400" />
            Spotify
          </span>
        </div>
        <div
          className="bg-gray-900/95 overflow-hidden rounded-b-lg backdrop-blur-sm"
          style={{ height: `calc(${dimensions.height}px - 1.5rem)` }}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <iframe
              src={defaultSpotifyEmbed}
              width="100%"
              height="100%"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
              style={{ border: "none" }}
            />
          </div>
        </div>

        {!isMobile && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none"
            onMouseDown={startResize}
            onTouchStart={startTouchResize}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
