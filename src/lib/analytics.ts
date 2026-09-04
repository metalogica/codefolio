import { track } from "@vercel/analytics";

// The conversion events that matter for a portfolio. Typed so call sites
// can't drift into ad-hoc event names.
export type EventName =
  | "cv_open"
  | "calendly_click"
  | "email_click"
  | "github_click"
  | "social_click"
  | "chat_submit";

export function trackEvent(
  name: EventName,
  props?: Record<string, string>,
): void {
  track(name, props);
}
