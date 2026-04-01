export function getOriginFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/`;
  } catch {
    return null;
  }
}

export async function ensureHostPermission(
  url: string,
): Promise<boolean> {
  const origin = getOriginFromUrl(url);
  if (!origin) return false;

  const hasPermission = await chrome.permissions.contains({
    origins: [origin],
  });
  if (hasPermission) return true;

  return chrome.permissions.request({ origins: [origin] });
}
