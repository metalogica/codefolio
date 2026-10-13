// Render src/cv/cv.html as plain text for the terminal's cv.txt.
//
// The CV's HTML is the single source; this walks its known structure rather
// than keeping a hand-written text copy that would drift. Browser-only
// (DOMParser) — call it from an event handler, never during render.

const ROW_SELECTOR = ".experience-section, .hackathon-section, .education-section";
const DATE_SELECTOR = ".experience-date, .education-date, .hackathon-date";
const BLOCK_SELECTOR = "div, p, ul, section";

function clean(el: Element | null | undefined): string {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function heading(text: string): string[] {
  const title = text.toUpperCase();
  return ["", title, "-".repeat(title.length)];
}

function walk(el: Element, out: string[]): void {
  for (const child of Array.from(el.children)) {
    if (child.matches(".section-title")) {
      out.push(...heading(clean(child)));
    } else if (child.matches(ROW_SELECTOR)) {
      const date = child.querySelector(DATE_SELECTOR);
      const title = Array.from(child.children).find((c) => c !== date);
      out.push("", date ? `${clean(title)} (${clean(date)})` : clean(title));
    } else if (child.tagName === "P") {
      out.push(clean(child));
    } else if (child.tagName === "UL") {
      for (const li of Array.from(child.querySelectorAll("li"))) {
        out.push(`  - ${clean(li)}`);
      }
    } else if (!child.querySelector(BLOCK_SELECTOR)) {
      const text = clean(child);
      if (text) out.push(text);
    } else {
      walk(child, out);
    }
  }
}

export function cvHtmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll('[aria-hidden="true"], script, style').forEach((n) => n.remove());

  const header = doc.querySelector(".header");
  const out: string[] = [
    clean(header?.querySelector("h1")).toUpperCase(),
    clean(header?.querySelector("h2")),
    "",
  ];

  // Contact row: print link targets, which mean something as plain text
  // ("metalogica" alone does not).
  for (const item of Array.from(header?.querySelectorAll(".contact-item") ?? [])) {
    const link = item.querySelector("a");
    out.push(link?.getAttribute("href")?.replace(/^mailto:/, "") ?? clean(item));
  }

  header?.remove();
  walk(doc.body, out);

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
