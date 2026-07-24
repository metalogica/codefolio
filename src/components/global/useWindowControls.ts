import { useEffect, useRef, useState } from "react";

export const MIN_WINDOW_WIDTH = 300;
export const MIN_WINDOW_HEIGHT = 200;
export const MOBILE_BREAKPOINT = 768;

const MOBILE_EDGE_PADDING = 10;
const DEFAULT_MOBILE_Y = 100;
const DEFAULT_MOBILE_HEIGHT = 400;

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowLayout {
  position: WindowPosition;
  size: WindowSize;
}

export interface UseWindowControlsOptions {
  desktopPosition: WindowPosition;
  desktopSize: WindowSize;
  /** Layout used below MOBILE_BREAKPOINT; receives the viewport size. */
  mobileLayout?: (viewportWidth: number, viewportHeight: number) => WindowLayout;
  /** Also treat mobile user agents as mobile regardless of width. */
  detectUserAgent?: boolean;
}

const defaultMobileLayout = (viewportWidth: number): WindowLayout => ({
  position: { x: MOBILE_EDGE_PADDING, y: DEFAULT_MOBILE_Y },
  size: {
    width: viewportWidth - MOBILE_EDGE_PADDING * 2,
    height: DEFAULT_MOBILE_HEIGHT,
  },
});

export function useWindowControls({
  desktopPosition,
  desktopSize,
  mobileLayout = defaultMobileLayout,
  detectUserAgent = false,
}: UseWindowControlsOptions) {
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState(desktopPosition);
  const [dimensions, setDimensions] = useState(desktopSize);
  const [_isResizing, setIsResizing] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth < MOBILE_BREAKPOINT ||
        (detectUserAgent &&
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ));
      setIsMobile(mobile);

      if (mobile) {
        const layout = mobileLayout(window.innerWidth, window.innerHeight);
        setPosition(layout.position);
        setDimensions(layout.size);
      } else {
        setPosition(desktopPosition);
        setDimensions(desktopSize);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
    // Initial layout values are config, not reactive state.
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current && !isMobile) {
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
      setDimensions({
        width: Math.max(
          MIN_WINDOW_WIDTH,
          startWidth + (moveEvent.clientX - startX),
        ),
        height: Math.max(
          MIN_WINDOW_HEIGHT,
          startHeight + (moveEvent.clientY - startY),
        ),
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
          setDimensions({
            width: Math.max(
              MIN_WINDOW_WIDTH,
              startWidth + (moveTouch.clientX - startX),
            ),
            height: Math.max(
              MIN_WINDOW_HEIGHT,
              startHeight + (moveTouch.clientY - startY),
            ),
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

  return {
    isMobile,
    position,
    dimensions,
    dragRef,
    onMouseDown,
    onTouchStart,
    startResize,
    startTouchResize,
  };
}
