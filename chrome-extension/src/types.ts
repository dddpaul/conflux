export interface ConfluencePageInfo {
  baseUrl: string;
  spaceKey: string;
  pageId: string;
  pageTitle: string;
}

export interface ConversionOptions {
  headingStyle: "atx" | "setext";
  codeBlockStyle: "fenced" | "indented";
  bulletListMarker: "-" | "+" | "*";
}

export interface ExportResult {
  markdown: string;
  filename: string;
}
