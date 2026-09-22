// CodeMirror 6 editor for lab files (DESIGN.md → Labs). Themed only through tokens. Tab indents;
// Esc then Tab leaves the editor (CodeMirror's tab-focus escape), which the description says.
import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const theme = EditorView.theme({
  "&": {
    color: "var(--ink)",
    backgroundColor: "var(--sheet)",
    fontSize: "var(--text-small)",
    height: "100%",
  },
  "&.cm-focused": { outline: "2px solid var(--focus)", outlineOffset: "-2px" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "var(--leading-ui)" },
  ".cm-content": { caretColor: "var(--route)", padding: "var(--space-3) 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--route)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--code-selection)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--code-gutter)",
    color: "var(--ink-muted)",
    borderRight: "var(--border-width) solid var(--line)",
  },
  ".cm-activeLine": { backgroundColor: "var(--code-gutter)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink)" },
  ".cm-foldPlaceholder": { backgroundColor: "transparent", border: "none", color: "var(--ink-muted)" },
  ".cm-matchingBracket": { backgroundColor: "var(--code-selection)", outline: "none" },
  ".cm-tooltip": { backgroundColor: "var(--sheet)", border: "var(--border-width) solid var(--line)", color: "var(--ink)" },
  ".cm-panels": { backgroundColor: "var(--sheet)", color: "var(--ink)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 var(--space-2) 0 var(--space-3)" },
});

const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword, tags.definitionKeyword, tags.moduleKeyword], color: "var(--code-keyword)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--code-string)" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "var(--code-number)" },
  { tag: [tags.function(tags.definition(tags.variableName)), tags.definition(tags.className)], color: "var(--code-definition)" },
  { tag: [tags.comment, tags.docString], color: "var(--code-comment)", fontStyle: "italic" },
  { tag: tags.invalid, color: "var(--route)" },
]);

interface Props {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  /** Accessible name of the editor. */
  label: string;
  /** Id of the element describing keyboard use. */
  describedBy?: string;
  /** Line to scroll to and select, counted from 1. */
  focusLine?: { line: number; nonce: number };
}

export function CodeEditor({ value, onChange, readOnly = false, label, describedBy, focusLine }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const attrs = useRef(new Compartment());

  useEffect(() => {
    // tabindex keeps read-only files reachable by keyboard, so their scroll area is too.
    const contentAttributes = (): Extension =>
      EditorView.contentAttributes.of({
        "aria-label": label,
        lang: "en",
        tabindex: "0",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      });
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        keymap.of([indentWithTab]),
        theme,
        syntaxHighlighting(highlight),
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        attrs.current.of(contentAttributes()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) change.current?.(update.state.doc.toString());
        }),
      ],
    });
    view.current = new EditorView({ state, parent: host.current! });
    return () => {
      view.current?.destroy();
      view.current = null;
    };
    // The editor owns its document after mount; external value changes go through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  // Replace the document when the value changes from outside (reset to starter, draft loaded).
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    const v = view.current;
    if (!v || !focusLine) return;
    const line = v.state.doc.line(Math.min(Math.max(focusLine.line, 1), v.state.doc.lines));
    v.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true });
    v.focus();
  }, [focusLine]);

  return <div className="code-editor" ref={host} lang="en" />;
}
