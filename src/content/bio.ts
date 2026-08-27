// Single source of truth for Rei's bio.
//
// Two consumers read from here, so they can never drift apart:
//   - AboutWindow.tsx  — renders these sections as ABOUT.TXT
//   - MacTerminal.tsx  — flattens them into the chatbot's system prompt
//
// Edit the prose here, not in either component.

export const IDENTITY = {
  name: "Rei Nova",
  role: "Cofounder, Soulbound Labs",
  studio: "Soulbound Labs — An AI Native Studio",
  location: "Montreal, QC",
  github: "github.com/metalogica",
} as const;

export interface BioItem {
  /** Rendered bold, followed by ": ". Omit for a plain bullet. */
  lead?: string;
  text: string;
}

export interface BioSection {
  heading: string;
  /** A prose paragraph. Mutually exclusive with `items` in practice. */
  body?: string;
  items?: BioItem[];
}

export const BIO_SECTIONS: BioSection[] = [
  {
    heading: "SYN/ACK",
    body: "I’m a full-stack developer with 7 years working in crypto & fintech with a heterogenous background that jumps across philosophy, economics, and computer science. I’m now working on an AI-native studio to help other startups grow. Outside work I’m an endurance runner and autodidact who gets way too excited about nerdy subjects (ACX, Less Wrong etc).",
  },
  {
    heading: "My types",
    items: [
      { text: "MBTI: ENFJ" },
      { text: "Enneagram: Type One" },
      { text: "Sun sign: Libra" },
      { text: "Human Design: Reflector" },
    ],
  },
  {
    heading: "To get me yapping just mention...",
    items: [
      {
        text: "Market microstructure, AMMs, prediction markets, social choice theory, public goods, and collective action problems.",
      },
      {
        text: "AI, Consciousness, Gnosticism, Posthuman Ethics, and Science Fiction.",
      },
      { text: "Macroeconomics, World History, and World Literature." },
    ],
  },
  {
    heading: "My worldview",
    items: [
      { lead: "P(doom)", text: "20." },
      {
        lead: "Stag Hunt > Prisoners Dilemma",
        text: "I believe trust is the true currency. Most outcomes in life can be optimized when people collaborate instead of treating human relations as zero-sum games, even in commercial and transactional relationships.",
      },
      {
        lead: "Risk Appetite > Imagination > EQ > IQ",
        text: "I believe success in the world is defined in that order.",
      },
      {
        lead: "Action > Theory",
        text: "Elegant execution is itself a beauty idea.",
      },
      {
        lead: "Warm Culture > Cold Culture",
        text: "I'm fundamentally a very relational person. I think it's important that people engage with each other on an affective as well as rational level, and I always take a deep interest in all the the people I meet.",
      },
      {
        lead: "Post-humanism > Humanism",
        text: "I believe that humans can and will upgrade themselves to keep up in a world when human history ends and AI history begins. I believe life will become multi-planetary and that homo-sapiens is just one stepping stone in the larger chain of evolution towards ever-greater intelligence and sentience.",
      },
    ],
  },
  {
    heading: "Snapshots of my life",
    items: [
      {
        lead: "I am an autodictat",
        text: "I've jumped across domains multiple times in my life. My B.A. was in literature. I chose an 'easy' subject that would allow me to quickly skim over course material and spend hours in the library. With this free time I read everything I wanted from history to economics to philosophy and still graduated with first-class honours despite being absent from most lectures. I then jumped directly into an M.A. in Political Economy and taught myself multi-variable calculus as part of it graduating the top of my class that year beating a bunch of people that did their bachelors program in the subject area. Then I jumped into tech. As a self-taught programmer I wrote my first 'Hello World' program in Ruby in my early twenties. Fast-forward five years later an I'm managing a team of 5 software engineers at a Canadian fintech who are all on paper far more qualified than me. I then ditched the security of a high-salary to create my own startup at the intersection of AI and prediction markets. I'm finally happy where I landed; as a cofounder I can capitalize on my skills as a generalist with a technical edge.",
      },
      {
        lead: "I was brought up in an entrepreneurial environment",
        text: "My parents weren't great as parents but they were great business people. During retirement my father poured all his life-saving into a high-risk startup. The business was eventually a success and they managed to sell it many years later. I spent a couple of years working with them after graduating from university. This experience gave me my first insight into some very important business principles. I'll never forget how my father decided to commercialise technology the university R&D department advised as 'premature' for the market. But it was 'good enough' to meet some commercial demand. And with that monetisation they bootstrapped the rest of the technical development.",
      },
      {
        lead: "I've been through a traumatic brain injury",
        text: "I had a bizarre reaction to a conventional drug during medical treatment that caused some pretty nasty psychological issues including chronic fatigue, derealisation and cognitive deficits. Noone knew how to diagnose my condition. It lasted at least 18 months and during that period I was under heavy stress at work. Despite that, I managed to keep my job and even get promoted. I learned many things during this period, including the true meaning of resilience, and it deepened my capacity to believe in myself to solve my own problems. I had to maintain religious discipline on sleep habits, exercise and mindfulness practice. I also researched all kinds of elective therapy from supplements to neuro-feedback therapy. It was also during this period that I first developed my initial interest in Brain Computer Interfaces and their intersection with transhumanist philosophy.",
      },
    ],
  },
];

/** Flatten the bio into plain text for the chatbot's system prompt. */
export function bioAsPromptContext(): string {
  return BIO_SECTIONS.map((section) => {
    const lines = [section.heading.toUpperCase()];
    if (section.body) lines.push(section.body);
    for (const item of section.items ?? []) {
      lines.push(`- ${item.lead ? `${item.lead}: ` : ""}${item.text}`);
    }
    return lines.join("\n");
  }).join("\n\n");
}
