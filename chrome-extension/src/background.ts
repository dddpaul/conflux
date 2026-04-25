import { fetchPageContent } from "./confluence-api";
import { processImages } from "./image-processor";
import { FetchPageMessage, FetchPageResponse } from "./types";

chrome.runtime.onMessage.addListener(
  (
    message: FetchPageMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: FetchPageResponse) => void,
  ) => {
    if (message.action !== "fetchPage") return false;

    (async () => {
      try {
        const content = await fetchPageContent(message.pageInfo);
        const processedHtml = await processImages(
          content.html,
          message.pageInfo.baseUrl,
        );
        sendResponse({
          success: true,
          content: { ...content, html: processedHtml },
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        sendResponse({ success: false, error: errorMessage });
      }
    })();

    return true; // keep message channel open for async response
  },
);

chrome.runtime.onInstalled.addListener(() => {
  console.log("Confluence to Markdown extension installed");
});
