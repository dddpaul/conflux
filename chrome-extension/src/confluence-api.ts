import { ConfluencePageInfo, ConfluenceApiResponse, PageContent } from "./types";

function buildApiUrl(pageInfo: ConfluencePageInfo): string {
  const base = pageInfo.baseUrl.replace(/\/+$/, "");
  return `${base}/rest/api/content/${pageInfo.pageId}?expand=body.export_view`;
}

function errorMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return "Authentication required — please log in to Confluence";
    case 403:
      return "Access denied — you don't have permission to view this page";
    case 404:
      return "Page not found — it may have been deleted or moved";
    default:
      if (status >= 500) {
        return `Confluence server error (${status}) — try again later`;
      }
      return `Unexpected error (${status})`;
  }
}

export async function fetchPageContent(
  pageInfo: ConfluencePageInfo,
): Promise<PageContent> {
  const url = buildApiUrl(pageInfo);

  const response = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(errorMessageForStatus(response.status));
  }

  const data = (await response.json()) as ConfluenceApiResponse;
  return {
    title: data.title,
    html: data.body.export_view.value,
  };
}
