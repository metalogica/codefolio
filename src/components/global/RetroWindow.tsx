import type { ReactNode } from "react";
import {
  useWindowControls,
  type UseWindowControlsOptions,
} from "./useWindowControls";

const TITLE_BAR_HEIGHT_PX = 28;

interface RetroWindowRenderContext {
  isMobile: boolean;
}

interface RetroWindowProps extends UseWindowControlsOptions {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  variant?: "chrome" | "terminal";
  resizable?: boolean;
  children: ReactNode | ((ctx: RetroWindowRenderContext) => ReactNode);
}

export default function RetroWindow({
  title,
  icon,
  onClose,
  variant = "chrome",
  resizable = true,
  children,
  ...controlOptions
}: RetroWindowProps) {
  const {
    isMobile,
    position,
    dimensions,
    dragRef,
    onMouseDown,
    onTouchStart,
    startResize,
    startTouchResize,
  } = useWindowControls(controlOptions);

  return (
    <div className="absolute" style={{ left: position.x, top: position.y }}>
      <div
        className="relative bevel-out bg-pc98-face p-[3px] flex flex-col"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className={`shrink-0 bg-pc98-title text-white font-bitmap text-sm flex items-center gap-2 px-2 select-none ${
            !isMobile ? "cursor-move touch-none" : ""
          }`}
          style={{
            height: `${TITLE_BAR_HEIGHT_PX}px`,
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            ...(!isMobile && { touchAction: "none" }),
          }}
        >
          {icon}
          <span className="flex-grow truncate">{title}</span>
          <button
            type="button"
            aria-label="Close window"
            className="shrink-0 w-[18px] h-[18px] bevel-out active:bevel-in bg-pc98-face text-black font-bitmap text-xs leading-none flex items-center justify-center cursor-pointer"
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>

        <div
          className={`flex-1 min-h-0 mt-[2px] bevel-in overflow-hidden ${
            variant === "terminal" ? "bg-black" : "bg-pc98-face"
          }`}
        >
          {typeof children === "function" ? children({ isMobile }) : children}
        </div>

        {resizable && !isMobile && (
          <div
            className="absolute bottom-[3px] right-[3px] w-4 h-4 cursor-se-resize touch-none"
            onMouseDown={startResize}
            onTouchStart={startTouchResize}
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--color-pc98-shadow) 0 1px, transparent 1px 4px)",
            }}
          />
        )}
      </div>
    </div>
  );
}
