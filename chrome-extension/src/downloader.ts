export function sanitizeTitle(title: string): string {
  return title.replace(/[/:?*<>|\\]/g, "").replace(/\s+/g, " ").trim();
}

export function buildFilename(
  spaceKey: string,
  pageId: string,
  title: string,
): string {
  const prefix = spaceKey || pageId;
  return `${prefix} - ${sanitizeTitle(title)}.md`;
}

export async function downloadMarkdown(
  markdown: string,
  filename: string,
): Promise<void> {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({ url, filename, saveAs: false });
  } finally {
    URL.revokeObjectURL(url);
  }
}
