// Renders every block type from a fixture, including an unknown type and `data` with unknown
// shapes (rfcs/0000-content-model.md → Checks). Refs and resources are real model keys so link
// resolution is exercised too.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import { beforeAll, describe, expect, test } from "vitest";
import type { Block as BlockData } from "../../lib/atlas";
import Block from "./Block.astro";

const title = { en: "Fixture", vi: "Mẫu" };
const fixture: Record<string, unknown> = {
  text: { type: "text", id: "lead", title, body: { en: "First paragraph.\n\nSecond paragraph." } },
  list: { type: "list", id: "steps", title, ordered: true, items: [{ en: "Step one" }, { en: "Step two", vi: "Bước hai" }] },
  prerequisites: {
    type: "prerequisites",
    id: "needs",
    title,
    items: [
      { ref: "ai.evaluation" },
      {
        ref: "systems.api-service-design",
        bridge: { diagnostic: { en: "Bridge question" }, resource: "article.aws-idempotent-apis", locator: { en: "Bridge locator" } },
      },
    ],
  },
  diagnostic: { type: "diagnostic", id: "check", title, step: true, tasks: [{ en: "Task A" }, { en: "Task B" }], pass_condition: { en: "Pass rule" } },
  sources: {
    type: "sources",
    id: "read",
    title,
    step: true,
    rows: [{ resource: "article.aws-idempotent-apis", locator: { en: "Exact section" }, purpose: { en: "Reason" } }],
  },
  practice: {
    type: "practice",
    id: "do",
    title,
    groups: [
      {
        label: { en: "Independent" },
        items: [
          { text: { en: "Build the lab" }, path: "labs/self-attention/", ref: "lab:self-attention" },
          { text: { en: "Read along" }, resource: "article.aws-idempotent-apis", locator: { en: "Chapter 3" } },
        ],
      },
    ],
  },
  markdown: {
    type: "text",
    id: "brief",
    title,
    format: "markdown",
    body: { en: "## Task 1\n\nOpen [cases](cases.jsonl) and [the route](../../curriculum/07-ai-engineering/evaluation/).\n\n<script>alert(1)</script>" },
  },
  runner: {
    type: "runner",
    id: "runner",
    title,
    step: true,
    runtime: "pyodide",
    editable: "starter.py",
    run: "tests.py",
    reference: "solution.py",
    files: { "starter.py": "def answer():\n    raise NotImplementedError\n", "tests.py": "import starter\n", "solution.py": "def answer():\n    return 42\n" },
  },
  data: { type: "data", id: "extra", title, value: { nested: [1, true, { en: "Localised leaf" }, { deeper: ["x"] }] } },
  unknown: { type: "timeline", id: "odd", title, entries: [{ year: 2026, note: "Unknown shape" }] },
};

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

const render = (name: string, lang: "en" | "vi" = "en") =>
  container.renderToString(Block, {
    props: {
      block: fixture[name] as BlockData,
      lang,
      itemRef: name === "runner" ? "lab:evaluation-harness" : "fixture.item",
      target: "demonstrated",
      after: [],
      headingId: "h",
      sourcePath: "labs/evaluation-harness",
    },
  });

describe("block renderer", () => {
  test("text splits paragraphs", async () => {
    const html = await render("text");
    expect(html).toContain("<p class=\"reading\"");
    expect(html).toContain("Second paragraph.");
  });

  test("list keeps order and marks English fallbacks on Vietnamese pages", async () => {
    const html = await render("list", "vi");
    expect(html).toMatch(/<ol[^>]*>/);
    expect(html).toMatch(/<li lang="en"[^>]*>Step one<\/li>/);
    expect(html).toContain("Bước hai");
  });

  test("prerequisites link pages and show bridges", async () => {
    const html = await render("prerequisites");
    expect(html).toContain('href="/en/routes/ai.evaluation/"');
    expect(html).toContain("Bridge question");
    expect(html).toContain("Bridge locator");
    expect(html).toContain('id="bridge-systems.api-service-design"');
  });

  test("diagnostic renders the first task card as an island", async () => {
    const html = await render("diagnostic");
    expect(html).toContain("astro-island");
    expect(html).toContain("Task 1 of 2");
    // Attempt first: the pass condition is not shown before the tasks are answered.
    expect(html).not.toContain(">Pass condition<");
  });

  test("sources show the resource, its kind, the exact locator, and why", async () => {
    const html = await render("sources");
    expect(html).toContain("Exact section");
    expect(html).toContain("Reason");
    expect(html).toContain("aws.amazon.com");
  });

  test("practice links repository paths and resources", async () => {
    const html = await render("practice");
    expect(html).toContain("/tree/main/labs/self-attention");
    expect(html).toContain("Chapter 3");
  });

  test("markdown text shifts headings, resolves relative links, and escapes raw HTML", async () => {
    const html = await render("markdown");
    expect(html).toContain("<h3>Task 1</h3>");
    expect(html).toContain('href="https://github.com/canhta/ai-engineering-atlas/tree/main/labs/evaluation-harness/cases.jsonl"');
    expect(html).toContain('href="/en/routes/ai.evaluation/"');
    expect(html).not.toContain("<script>alert");
  });

  test("runner renders the lab workbench with the editable file and hides the reference", async () => {
    const html = await render("runner");
    expect(html).toContain("astro-island");
    expect(html).toContain("starter.py");
    expect(html).toContain("tests.py");
    expect(html).toContain("Run tests");
    // The reference is shipped in the props but not shown as a tab until the learner opens it.
    expect(html).not.toMatch(/<code>solution\.py<\/code>/);
  });

  test("data renders nested values of any shape", async () => {
    const html = await render("data");
    expect(html).toContain("Localised leaf");
    expect(html).toContain("deeper");
    expect(html).toContain("true");
  });

  test("an unknown block type falls back to data", async () => {
    const html = await render("unknown");
    expect(html).toContain("timeline");
    expect(html).toContain("Unknown shape");
    expect(html).toContain("2026");
  });
});
