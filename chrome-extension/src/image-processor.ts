export function extractAttachmentUrls(html: string): string[] {
  const regex = /\bsrc=(["'])((?:https?:\/\/[^"']*)?\/download\/attachments\/[^"']*)\1/gi;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[2];
    if (!url.includes("/thumbnails/") && !url.includes("/generated/")) {
      urls.push(url);
    }
  }
  return [...new Set(urls)];
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function processImages(
  html: string,
  baseUrl: string,
): Promise<string> {
  const urls = extractAttachmentUrls(html);
  if (urls.length === 0) return html;

  const base = baseUrl.replace(/\/+$/, "");
  const replacements = new Map<string, string>();

  await Promise.all(
    urls.map(async (url) => {
      const fullUrl = url.startsWith("http") ? url : `${base}${url}`;
      try {
        const response = await fetch(fullUrl, { credentials: "include" });
        if (!response.ok) return;
        const contentType = (response.headers.get("content-type") || "")
          .split(";")[0]
          .trim();
        if (!contentType.startsWith("image/")) return;
        const buffer = await response.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        replacements.set(url, `data:${contentType};base64,${base64}`);
      } catch {
        // Leave original URL on failure
      }
    }),
  );

  if (replacements.size === 0) return html;

  let result = html;
  for (const [original, dataUri] of replacements) {
    result = result.split(original).join(dataUri);
  }
  return result;
}
