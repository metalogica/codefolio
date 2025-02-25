import { useState, useEffect, useRef } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

const PLACEHOLDER_MESSAGES = [
  'Type your question...',
  'How old are you?',
  'What are your skills?',
  'Where are you located?',
  'What projects have you worked on?',
];

export default function MacTerminal() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    input: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [_isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  const welcomeMessage = `Welcome to My Portfolio

Name: Rei Jarram
Role: Full Stack Developer
Location: Montreal, QC

Contact: rjarram@me.com
GitHub: github.com/reijarram

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const systemPrompt = `IMPORTANT: You ARE Rei Jarram. You must always speak in first-person ("I", "my", "me"). Never refer to "rei" in third-person.
CURRENT DATE: ${formattedDate} - Always use this exact date when discussing the current date/year.

Example responses:
Q: "Where do you live?"
A: "I live in Montreal, QC"

Q: "What's your background?"
A: "I'm a Full Stack Developer with experience in React, Next.js, and Node.js"

Q: "How old are you?"
A: "I'm 32 years old"

Core details about me:
- I'm 32 years old
- I live in Montreal, QC
- I'm a Full Stack Developer
- My email is rjarram@me.com
- I was born in 1992
- I was born in Xi'an, China

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
    setChatHistory((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: 'assistant', content: welcomeMessage },
      ],
    }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();

    if (!userInput) return;

    setChatHistory((prev) => ({
      messages: [...prev.messages, { role: 'user', content: userInput }],
      input: '',
    }));

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.messages,
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.message },
        ],
      }));
    } catch {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content:
              'I\'m having trouble processing that. Please email me at rjarram@me.com',
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  // Drag handlers
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
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  // Resize handlers
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Calculate new width and height with minimum constraints
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(
        200,
        startHeight + (moveEvent.clientY - startY),
      );

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="absolute" style={{ left: position.x, top: position.y }}>
      <div
        ref={terminalRef}
        className="relative shadow-lg mx-4 sm:mx-0"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={onMouseDown}
          className="bg-gray-800 h-6 flex items-center space-x-2 px-4 cursor-move"
        >
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2">
            <FaRegFolderClosed size={14} className="text-gray-300" />
            johndoe.com ⸺ zsh
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
                  {msg.role === 'user' ? (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-400">{'>'}</span>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="whitespace-nowrap">guest@rei root %</span>
                <input
                  type="text"
                  value={chatHistory.input}
                  onChange={handleInputChange}
                  className="w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                  placeholder={placeholder}
                />
              </div>
            </form>
          </div>
        </div>

        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={startResize}
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        ></div>
      </div>
    </div>
  );
}
