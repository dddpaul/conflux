import { fetchPageContent } from "./confluence-api";
import { ConfluencePageInfo, PageContent } from "./types";

export interface FetchPageMessage {
  action: "fetchPage";
  pageInfo: ConfluencePageInfo;
}

export type FetchPageResponse =
  | { success: true; content: PageContent }
  | { success: false; error: string };

chrome.runtime.onMessage.addListener(
  (
    message: FetchPageMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: FetchPageResponse) => void,
  ) => {
    if (message.action !== "fetchPage") return false;

    fetchPageContent(message.pageInfo)
      .then((content) => {
        sendResponse({ success: true, content });
      })
      .catch((err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        sendResponse({ success: false, error: errorMessage });
      });

    return true; // keep message channel open for async response
  },
);

chrome.runtime.onInstalled.addListener(() => {
  console.log("Confluence to Markdown extension installed");
});
