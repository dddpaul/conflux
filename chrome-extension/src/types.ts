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

export interface MacroToggles {
  panels: boolean;
  expand: boolean;
  toc: boolean;
  status: boolean;
}

export interface ExtensionSettings {
  headingStyle: "atx" | "setext";
  codeBlockStyle: "fenced" | "indented";
  bulletListMarker: "-" | "+" | "*";
  brHandling: "remove" | "newline" | "keep";
  macros: MacroToggles;
}

export interface ExportResult {
  markdown: string;
  filename: string;
}

export interface ConfluenceApiResponse {
  id: string;
  title: string;
  body: {
    export_view: {
      value: string;
    };
  };
  history?: {
    createdBy?: {
      displayName?: string;
    };
    createdDate?: string;
  };
  space?: {
    key?: string;
  };
}

export interface PageContent {
  title: string;
  html: string;
  author: string;
  published: string;
  pageId: string;
  spaceKey: string;
  sourceUrl: string;
}

export interface FetchPageMessage {
  action: "fetchPage";
  pageInfo: ConfluencePageInfo;
}

export type FetchPageResponse =
  | { success: true; content: PageContent }
  | { success: false; error: string };
