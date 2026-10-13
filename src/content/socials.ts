// Single source of truth for Rei's profile URLs and contact details.
//
// Consumers read from here, so they can never drift apart:
//   - SocialsWindow.tsx   — renders the icon grid
//   - Taskbar.tsx         — email / GitHub / Calendly tray links
//   - ChatWindow.tsx      — contact fallback in the chatbot's system prompt
//   - lib/terminal/vfs.ts — the terminal's socials.txt
//   - LandingPage.astro   — crawlable profile links in the sr-only <main>
//   - BaseHead.astro      — JSON-LD Person sameAs + twitter card handle

export const GITHUB_URL = "https://github.com/metalogica";
export const TWITTER_HANDLE = "@0xmoreofthesame";
export const CONTACT_EMAIL = "rei@soulboundlabs.com";
export const CALENDLY_URL = "https://calendly.com/rei-soulboundlabs/30min";

export interface SocialProfile {
  name: string;
  url: string;
}

export const SOCIAL_LINKS: SocialProfile[] = [
  { name: "Instagram", url: "https://instagram.com/moreofthesame" },
  { name: "LinkedIn", url: "https://linkedin.com/in/reinova" },
  { name: "Twitter", url: "https://twitter.com/0xmoreofthesame" },
];
