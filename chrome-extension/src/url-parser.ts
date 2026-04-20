import { ConfluencePageInfo } from "./types";

const SERVER_VIEWPAGE_PATTERN =
  /\/pages\/viewpage\.action/;

const CLOUD_PAGES_PATTERN =
  /(?:\/wiki)?\/spaces\/([^/]+)\/pages\/(\d+)(?:\/([^?#]*))?/;

const SERVER_DISPLAY_PATTERN =
  /\/display\/([^/]+)\/([^?#]+)/;

export function parseConfluenceUrl(
  url: string,
): ConfluencePageInfo | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const baseUrl = parsed.origin;

  // Server/DC: /pages/viewpage.action?pageId=123
  if (SERVER_VIEWPAGE_PATTERN.test(parsed.pathname)) {
    const pageId = parsed.searchParams.get("pageId");
    if (!pageId || !/^\d+$/.test(pageId)) {
      return null;
    }
    const spaceKey = parsed.searchParams.get("spaceKey") ?? "";
    const title = parsed.searchParams.get("title") ?? "";
    return { baseUrl, spaceKey, pageId, pageTitle: decodeURIComponent(title) };
  }

  // Cloud: /wiki/spaces/SPACE/pages/123/Title or /spaces/SPACE/pages/123/Title
  const cloudMatch = parsed.pathname.match(CLOUD_PAGES_PATTERN);
  if (cloudMatch) {
    const spaceKey = cloudMatch[1];
    const pageId = cloudMatch[2];
    const rawTitle = cloudMatch[3] ?? "";
    const pageTitle = decodeURIComponent(rawTitle.replace(/\+/g, " "));
    return { baseUrl, spaceKey, pageId, pageTitle };
  }

  // Server/DC: /display/SPACE/Page+Title (no pageId in URL)
  const displayMatch = parsed.pathname.match(SERVER_DISPLAY_PATTERN);
  if (displayMatch) {
    const spaceKey = displayMatch[1];
    const rawTitle = displayMatch[2];
    const pageTitle = decodeURIComponent(rawTitle.replace(/\+/g, " "));
    return { baseUrl, spaceKey, pageId: "", pageTitle };
  }

  return null;
}
