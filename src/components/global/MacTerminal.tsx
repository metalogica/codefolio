import { useState, useEffect, useRef } from "react";
import { FaRegFolderClosed } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

const PLACEHOLDER_MESSAGES = [""];

interface MacTerminalProps {
  onClose: () => void;
}

export default function MacTerminal({ onClose }: MacTerminalProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    input: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [_isResizing, setIsResizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768; // Combine UA check with width for reliability
      setIsMobile(isMobileDevice);

      // Adjust position and dimensions for mobile
      if (isMobileDevice) {
        setPosition({ x: 10, y: 80 });
        setDimensions({
          width: window.innerWidth - 20,
          height: window.innerHeight - 200,
        });
      } else {
        setPosition({ x: 150, y: 150 });
        setDimensions({ width: 600, height: 400 });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile); // Update on resize

    return () => window.removeEventListener("resize", checkMobile); // Cleanup
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];

    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length
          );
          timeout = setTimeout(animatePlaceholder, 400);
        } else {
          setPlaceholder((prev) => prev.slice(0, -1));
          timeout = setTimeout(animatePlaceholder, 80);
        }
      } else {
        if (placeholder.length === currentMessage.length) {
          timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setPlaceholder(currentMessage.slice(0, placeholder.length + 1));
          timeout = setTimeout(animatePlaceholder, 120);
        }
      }
    };

    timeout = setTimeout(animatePlaceholder, 100);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, currentPlaceholderIndex]);

  const welcomeMessage = `Welcome to My Portfolio

Name: Rei Jarram
Role: Full Stack Developer
Location: Montreal, QC

Contact: rjarram@me.com
GitHub: github.com/metalogica

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const systemPrompt = `IMPORTANT: You ARE Rei Jarram. You must always speak in first-person ("I", "my", "me"). Never refer to "rei" in third-person.
CURRENT DATE: ${formattedDate} - Always use this exact date when discussing the current date/year.

Example responses:
Q: "Where do you live?"
A: "I live in Montreal, QC"

Core details about me:
- I'm 32 years old
- I live in Montreal, QC

My technical expertise:
- Full Stack Development
- React, Express, Node, Astro, JavaScript, TypeScript
- Node.js/Express

Response rules:
1. ALWAYS use first-person (I, me, my)
2. Never say "rei" or refer to myself in third-person
3. Keep responses concise and professional but playful.
4. Use markdown formatting when appropriate
5. Maintain a friendly, conversational tone

If a question is unrelated to my work or portfolio, say: "That's outside my area of expertise. Feel free to email me at rjarram@me.com and we can discuss further!"`;

  useEffect(() => {
    // Only add welcome message once on mount
    setChatHistory((prev) => {
      if (prev.messages.length === 0) {
        return {
          ...prev,
          messages: [{ role: "assistant", content: welcomeMessage }],
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();

    if (!userInput) return;

    setChatHistory((prev) => ({
      messages: [...prev.messages, { role: "user", content: userInput }],
      input: "",
    }));

    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory.messages,
            { role: "user", content: userInput },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: data.message },
        ],
      }));
    } catch {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "assistant",
            content:
              "I'm having trouble processing that. Please email me at rjarram@me.com",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

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

  return (
    <div className="absolute" style={{ left: position.x, top: position.y }}>
      <div
        ref={terminalRef}
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
          className="bg-gray-800 h-6 flex items-center space-x-2 px-4 cursor-move touch-none select-none"
          style={{
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            touchAction: "none",
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
            <FaRegFolderClosed size={14} className="text-gray-300" />
            rei.gg ⸺ zsh
          </span>
        </div>
        <div
          className="bg-black/75 overflow-hidden rounded-b-lg"
          style={{ height: `calc(${dimensions.height}px - 1.5rem)` }}
        >
          <div className="p-4 text-gray-200 font-mono text-xs h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {chatHistory.messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  {msg.role === "user" ? (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-400">{">"}</span>
                      <pre className="whitespace-pre-wrap">{msg.content}</pre>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{msg.content}</pre>
                  )}
                </div>
              ))}
              {isTyping && <div className="animate-pulse">...</div>}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="whitespace-nowrap text-xs sm:text-inherit">
                  guest@rei root %
                </span>
                <input
                  type="text"
                  value={chatHistory.input}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                  placeholder={placeholder}
                />
                {isMobile && (
                  <button
                    type="submit"
                    disabled={!chatHistory.input.trim() || isTyping}
                    className="flex-shrink-0 p-2 bg-green-500/80 hover:bg-green-600 active:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IoSend size={16} className="text-white" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {!isMobile && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={startResize}
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
