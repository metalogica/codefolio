import { useState, useRef, useEffect } from "react";
import { FaShareAlt } from "react-icons/fa";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

interface SocialsWindowProps {
  onClose: () => void;
}

interface SocialLink {
  name: string;
  icon: JSX.Element;
  url: string;
  color: string;
}

export default function SocialsWindow({ onClose }: SocialsWindowProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ x: 300, y: 150 });
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
  const [_isResizing, setIsResizing] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Social media links - Update these with your actual URLs
  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      icon: <FaInstagram size={48} />,
      url: "https://instagram.com/moreofthesame",
      color: "hover:text-pink-500",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={48} />,
      url: "https://linkedin.com/in/rjarram",
      color: "hover:text-blue-500",
    },
    {
      name: "Twitter",
      icon: <FaXTwitter size={48} />,
      url: "https://twitter.com/0xmetalogica",
      color: "hover:text-sky-400",
    },
    {
      name: "Bluesky",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
        </svg>
      ),
      url: "https://bsky.app/profile/cybershades.bsky.social",
      color: "hover:text-blue-400",
    },
    {
      name: "Farcaster",
      icon: (
        <svg viewBox="0 0 1000 1000" fill="currentColor" className="w-12 h-12">
          <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
          <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
          <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
        </svg>
      ),
      url: "https://warpcast.com/moreofthesame",
      color: "hover:text-purple-400",
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Adjust position and size for mobile
      if (mobile) {
        setPosition({ x: 10, y: 100 });
        setDimensions({ width: window.innerWidth - 20, height: 400 });
      } else {
        setPosition({ x: 300, y: 150 });
        setDimensions({ width: 550, height: 350 });
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
        200,
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
            200,
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
          className={`bg-gray-800 h-6 flex items-center space-x-2 px-4 ${!isMobile ? 'cursor-move touch-none' : ''} select-none`}
          style={{
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            ...((!isMobile && { touchAction: "none" })),
          }}
        >
          <div
            className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onClose();
            }}
          ></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2">
            <FaShareAlt size={14} className="text-gray-300" />
            Socials
          </span>
        </div>
        <div
          className="bg-gray-900/95 overflow-hidden rounded-b-lg backdrop-blur-sm"
          style={{ height: `calc(${dimensions.height}px - 1.5rem)` }}
        >
          <div className="p-8 text-gray-200 h-full flex items-center justify-center overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-6 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 ${social.color} group`}
                >
                  <div className="transition-transform duration-200 group-hover:scale-110">
                    {social.icon}
                  </div>
                  <span className="mt-3 text-sm font-medium text-gray-300 group-hover:text-white">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
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
