// Markdown bodies of `text` blocks (format: markdown), rendered at build time. Relative links
// resolve against the item's repository path: to the atlas page of the item at that path when
// it has one, otherwise to the file in the repository. Headings move down one level, since the
// block's own title is the h2. Raw HTML is escaped: bodies are content, not markup.
import { Marked, type Tokens } from "marked";
import type { Lang } from "../i18n";
import { itemUrl, refAtPath, repoUrl } from "./atlas";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Join a relative link onto a repository directory, resolving `.` and `..`. */
export function resolveRepoPath(base: string, href: string): string {
  const parts = base.replace(/\/$/, "").split("/").filter(Boolean);
  for (const segment of href.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment && segment !== ".") parts.push(segment);
  }
  return parts.join("/");
}

export function renderMarkdown(body: string, sourcePath: string, lang: Lang): string {
  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type !== "link") return;
      const link = token as Tokens.Link;
      if (/^([a-z]+:|#|\/)/i.test(link.href)) return;
      const [path, anchor] = link.href.split("#");
      const repoPath = resolveRepoPath(sourcePath, path);
      const ref = refAtPath(repoPath);
      const page = ref ? itemUrl(lang, ref) : undefined;
      link.href = page ?? `${repoUrl(repoPath)}${anchor ? `#${anchor}` : ""}`;
    },
    renderer: {
      heading({ tokens, depth }) {
        const level = Math.min(depth + 1, 6);
        return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
      html({ text }) {
        return escapeHtml(text);
      },
      link({ href, tokens }) {
        const external = /^https?:/i.test(href);
        const attrs = external ? ' rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtml(href)}"${attrs}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  return marked.parse(body, { async: false });
}
