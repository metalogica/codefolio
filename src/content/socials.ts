// Single source of truth for Rei's profile URLs.
//
// Three consumers read from here, so they can never drift apart:
//   - SocialsWindow.tsx   — renders the icon grid
//   - LandingPage.astro   — crawlable profile links in the sr-only <main>
//   - BaseHead.astro      — JSON-LD Person sameAs + twitter card handle

export const GITHUB_URL = "https://github.com/metalogica";
export const TWITTER_HANDLE = "@0xmoreofthesame";

export interface SocialProfile {
  name: string;
  url: string;
}

export const SOCIAL_LINKS: SocialProfile[] = [
  { name: "Instagram", url: "https://instagram.com/moreofthesame" },
  { name: "LinkedIn", url: "https://linkedin.com/in/reinova" },
  { name: "Twitter", url: "https://twitter.com/0xmoreofthesame" },
];
