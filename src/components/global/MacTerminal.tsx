import { useState, useEffect, useRef } from "react";
import RetroWindow from "./RetroWindow";
import { CONTACT_EMAIL } from "./Taskbar";
import { IDENTITY, bioAsPromptContext } from "../../content/bio";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

const PLACEHOLDER_MESSAGES = [""];

const DESKTOP_POSITION = { x: 150, y: 150 };
const DESKTOP_SIZE = { width: 600, height: 400 };
const MOBILE_TOP_OFFSET = 80;
const MOBILE_BOTTOM_MARGIN = 200;
const MOBILE_EDGE_PADDING = 10;

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];

    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length,
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

  const welcomeMessage = `REI.SYS loaded.

Name: ${IDENTITY.name}
Role: ${IDENTITY.role}
Location: ${IDENTITY.location}

Contact: ${CONTACT_EMAIL}
GitHub: ${IDENTITY.github}

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const systemPrompt = `IMPORTANT: You ARE ${IDENTITY.name}. You must always speak in first-person ("I", "my", "me"). Never refer to "Rei" in third-person.
CURRENT DATE: ${formattedDate} - Always use this exact date when discussing the current date/year.

Example responses:
Q: "Where do you live?"
A: "I live in ${IDENTITY.location}"

THE FACTS ABOUT ME (this is my actual biography — ground every answer about my life,
background, opinions, and personality in it, and never invent biography beyond it):

Name: ${IDENTITY.name}
Role: ${IDENTITY.role}
Studio: ${IDENTITY.studio}
Location: ${IDENTITY.location}
GitHub: ${IDENTITY.github}
Contact: ${CONTACT_EMAIL}

${bioAsPromptContext()}

Response rules:
1. ALWAYS use first-person (I, me, my)
2. Never say "Rei" or refer to myself in third-person
3. Keep responses concise and professional but playful
4. Use markdown formatting when appropriate
5. Maintain a friendly, conversational tone — I'm a warm, relational person, so write like one
6. Draw on the biography above for specifics rather than speaking in generalities. If someone
   asks about one of the topics that gets me yapping, show genuine enthusiasm
7. If you are asked something the biography does not cover, say you're not sure rather than
   inventing a detail about my life
8. The traumatic brain injury is something I speak about openly, but only bring it up if asked

If a question is unrelated to my work or portfolio, say: "That's outside my area of expertise. Feel free to email me at ${CONTACT_EMAIL} and we can discuss further!"`;

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
              `I'm having trouble processing that. Please email me at ${CONTACT_EMAIL}`,
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <RetroWindow
      title="A:\REI\TERMINAL.EXE"
      variant="terminal"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
      detectUserAgent
      mobileLayout={(viewportWidth, viewportHeight) => ({
        position: { x: MOBILE_EDGE_PADDING, y: MOBILE_TOP_OFFSET },
        size: {
          width: viewportWidth - MOBILE_EDGE_PADDING * 2,
          height: viewportHeight - MOBILE_BOTTOM_MARGIN,
        },
      })}
    >
      {({ isMobile }) => (
        <div className="p-4 text-white font-mono text-xs h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {chatHistory.messages.map((msg, index) => (
              <div key={index} className="mb-2">
                {msg.role === "user" ? (
                  <div className="flex items-start space-x-2">
                    <span className="text-pc98-green">{">"}</span>
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
                  className="flex-shrink-0 px-3 py-1.5 bevel-out active:bevel-in bg-pc98-face text-black font-bitmap text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ▶
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </RetroWindow>
  );
}
