import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { ConversionOptions, ExportResult } from "./types";

const DEFAULT_OPTIONS: ConversionOptions = {
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
};

function createTurndownService(options: ConversionOptions): TurndownService {
  const service = new TurndownService({
    headingStyle: options.headingStyle,
    codeBlockStyle: options.codeBlockStyle,
    bulletListMarker: options.bulletListMarker,
    fence: "```",
    br: "\n",
  });

  service.use(gfm);

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

function normalizeWhitespace(markdown: string): string {
  return markdown
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function convertHtmlToMarkdown(
  html: string,
  title: string,
  options?: Partial<ConversionOptions>,
): ExportResult {
  const mergedOptions: ConversionOptions = { ...DEFAULT_OPTIONS, ...options };
  const service = createTurndownService(mergedOptions);

  const rawMarkdown = service.turndown(html);
  const markdown = normalizeWhitespace(`# ${title}\n\n${rawMarkdown}`);
  const filename = `${slugifyTitle(title)}.md`;

  return { markdown, filename };
}
