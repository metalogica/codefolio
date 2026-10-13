import { useEffect, useRef, useState } from "react";
import RetroWindow from "./RetroWindow";
import { MOBILE_BREAKPOINT, tallMobileLayout } from "./useWindowControls";
import { IDENTITY, bioAsPlainText } from "../../content/bio";
import { CONTACT_EMAIL } from "../../content/socials";
import { trackEvent } from "../../lib/analytics";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const DESKTOP_POSITION = { x: 520, y: 120 };
const DESKTOP_SIZE = { width: 480, height: 440 };

const GREETING =
  "Hi! I'm Rei — ask me anything about my work, Soulbound Labs, or the things that get me yapping.";

function buildSystemPrompt(): string {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `IMPORTANT: You ARE ${IDENTITY.name}. You must always speak in first-person ("I", "my", "me"). Never refer to "Rei" in third-person.
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

${bioAsPlainText()}

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
}

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus on open, desktop only — on mobile it would pop the keyboard.
  useEffect(() => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();

    if (!userInput || isTyping) return;

    trackEvent("chat_submit");

    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...messages,
            { role: "user", content: userInput },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm having trouble processing that. Please email me at ${CONTACT_EMAIL}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <RetroWindow
      title="A:\REI\CHAT.EXE"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
      detectUserAgent
      mobileLayout={tallMobileLayout}
    >
      <div className="h-full flex flex-col gap-[3px] p-[3px] font-bitmap text-sm text-black">
        <div className="flex-1 min-h-0 overflow-y-auto bevel-in bg-white p-3 space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className="grid grid-cols-[auto_1fr] gap-x-2">
              <span
                className={`font-bold ${
                  msg.role === "user" ? "text-pc98-red" : "text-pc98-title"
                }`}
              >
                {msg.role === "user" ? "YOU:" : "REI:"}
              </span>
              <p className="min-w-0 whitespace-pre-wrap break-words">
                {msg.content}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 flex gap-[3px]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            aria-label="Message"
            className="flex-1 min-w-0 bevel-in bg-white px-2 py-1.5 outline-none placeholder-pc98-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="shrink-0 px-4 bevel-out active:bevel-in bg-pc98-face cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </form>

        {/* Status bar — also keeps the resize grip clear of the SEND button. */}
        <div
          className={`shrink-0 h-4 px-1 text-[11px] leading-4 text-pc98-shadow ${
            isTyping ? "animate-pulse" : ""
          }`}
          aria-live="polite"
        >
          {isTyping ? "REI is typing…" : "Ready"}
        </div>
      </div>
    </RetroWindow>
  );
}
