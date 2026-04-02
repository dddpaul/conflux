import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { ConversionOptions, ExportResult, MacroToggles } from "./types";

interface ConverterOptions extends ConversionOptions {
  brHandling?: "remove" | "newline" | "keep";
  macros?: MacroToggles;
}

const DEFAULT_OPTIONS: ConverterOptions = {
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  brHandling: "newline",
  macros: { panels: true, expand: true, toc: true, status: true },
};

function brOptionToString(br: "remove" | "newline" | "keep"): string {
  if (br === "remove") return "";
  if (br === "newline") return "\n";
  return "<br>";
}

function createTurndownService(options: ConverterOptions): TurndownService {
  const service = new TurndownService({
    headingStyle: options.headingStyle,
    codeBlockStyle: options.codeBlockStyle,
    bulletListMarker: options.bulletListMarker,
    fence: "```",
    br: brOptionToString(options.brHandling ?? "newline"),
  });

  service.use(gfm);

  const macros = options.macros ?? DEFAULT_OPTIONS.macros!;

  if (macros.panels) service.addRule("confluencePanel", {
    filter: (node) => {
      return (
        node.nodeName === "DIV" &&
        /\bconfluence-information-macro\b/.test(node.getAttribute("class") || "")
      );
    },
    replacement: (_content, node) => {
      const cls = (node as HTMLElement).getAttribute("class") || "";
      let prefix = "Note";
      if (cls.includes("confluence-information-macro-information")) prefix = "Info";
      else if (cls.includes("confluence-information-macro-warning")) prefix = "Warning";
      else if (cls.includes("confluence-information-macro-tip")) prefix = "Tip";

      const body = (node as HTMLElement).querySelector(
        ".confluence-information-macro-body",
      );
      const inner = body ? body.textContent?.trim() || "" : (node as HTMLElement).textContent?.trim() || "";
      const quoted = inner
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return `\n\n> **${prefix}:**\n${quoted}\n\n`;
    },
  });

  if (macros.expand) service.addRule("confluenceExpand", {
    filter: (node) => {
      return (
        node.nodeName === "DIV" &&
        /\bexpand-container\b/.test(node.getAttribute("class") || "")
      );
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const titleEl = el.querySelector(".expand-control-text");
      const title = titleEl?.textContent?.trim() || "Details";
      const contentEl = el.querySelector(".expand-content");
      const content = contentEl?.textContent?.trim() || "";
      return `\n\n<details>\n<summary>${title}</summary>\n\n${content}\n\n</details>\n\n`;
    },
  });

  if (macros.toc) service.addRule("confluenceToc", {
    filter: (node) => {
      return (
        node.nodeName === "DIV" &&
        /\btoc-macro\b/.test(node.getAttribute("class") || "")
      );
    },
    replacement: () => "",
  });

  if (macros.status) service.addRule("confluenceStatus", {
    filter: (node) => {
      if (node.nodeName !== "SPAN") return false;
      const cls = node.getAttribute("class") || "";
      return /\bstatus-macro\b/.test(cls) || /\baui-lozenge\b/.test(cls);
    },
    replacement: (_content, node) => {
      const text = (node as HTMLElement).textContent?.trim() || "";
      return `**[${text.toUpperCase()}]**`;
    },
  });

  service.addRule("stripStyleTag", {
    filter: "style",
    replacement: () => "",
  });

  service.addRule("confluenceUserMention", {
    filter: (node) => {
      return (
        node.nodeName === "A" &&
        /\bconfluence-userlink\b/.test(node.getAttribute("class") || "")
      );
    },
    replacement: (_content, node) => {
      return (node as HTMLElement).textContent?.trim() || "";
    },
  });

  service.addRule("confluenceCodeBlock", {
    filter: (node) => {
      return node.nodeName === "PRE" && extractLanguage(node) !== "";
    },
    replacement: (_content, node) => {
      const lang = extractLanguage(node);
      const code = node.textContent || "";
      return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    },
  });

  service.addRule("plainPreBlock", {
    filter: (node) => {
      return node.nodeName === "PRE" && extractLanguage(node) === "";
    },
    replacement: (_content, node) => {
      const code = node.textContent || "";
      return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
    },
  });

  return service;
}

function extractLanguage(node: HTMLElement): string {
  const raw = node.getAttribute("class") || "";
  if (!raw) return "";

  const brushMatch = raw.match(/\bbrush:\s*([a-zA-Z0-9]+)/);
  if (brushMatch) return brushMatch[1].toLowerCase();

  const langPrefixMatch = raw.match(/\blanguage-([a-zA-Z0-9]+)/);
  if (langPrefixMatch) return langPrefixMatch[1].toLowerCase();

  const knownLanguages = [
    "java", "javascript", "js", "python", "ruby", "sql",
    "xml", "html", "css", "bash", "shell", "groovy", "scala",
    "csharp", "cpp", "c", "go", "rust", "typescript", "ts",
    "json", "yaml", "yml", "php", "perl", "swift", "kotlin",
  ];
  const classNames = raw.split(/\s+/);
  for (const cls of classNames) {
    if (knownLanguages.includes(cls.toLowerCase())) {
      return cls.toLowerCase();
    }
  }

  return "";
}

function collapseTableRows(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let pendingRow: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (pendingRow !== null) {
      if (trimmed) {
        pendingRow += " " + trimmed;
      }
      if (trimmed.endsWith("|")) {
        result.push(pendingRow.replace(/ {2,}/g, " "));
        pendingRow = null;
      }
    } else if (trimmed.startsWith("|")) {
      if (trimmed.endsWith("|")) {
        result.push(line);
      } else {
        pendingRow = trimmed;
      }
    } else {
      result.push(line);
    }
  }

  if (pendingRow !== null) {
    result.push(pendingRow);
  }

  return result.join("\n");
}

function normalizeWhitespace(markdown: string): string {
  return markdown
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/[/\\:?*"<>|]/g, "")
    .trim();
}

export function convertHtmlToMarkdown(
  html: string,
  title: string,
  options?: Partial<ConverterOptions>,
): ExportResult {
  const mergedOptions: ConverterOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    macros: { ...DEFAULT_OPTIONS.macros!, ...options?.macros },
  };
  const service = createTurndownService(mergedOptions);

  const rawMarkdown = service.turndown(html);
  const collapsed = collapseTableRows(rawMarkdown);
  const markdown = normalizeWhitespace(`# ${title}\n\n${collapsed}`);
  const filename = `${sanitizeTitle(title)}.md`;

  return { markdown, filename };
}
