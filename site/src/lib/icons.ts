// The only import of the icon library. Components use these semantic names, so an
// icon means the same thing everywhere (DESIGN.md → Icons). Library: IBM Carbon,
// drawn for IBM Plex. Hand-written SVG is rejected by scripts/check-icons.mjs.
import {
  ArrowRight,
  ChartNetwork,
  CheckmarkFilled,
  CheckmarkOutline,
  ChevronDown,
  CircleDash,
  CircleFilled,
  Close,
  Download,
  ErrorFilled,
  Incomplete,
  InProgress,
  Launch,
  List,
  Play,
  Renew,
  Search,
  Stop,
  Upload,
} from "@carbon/icons-react";

export const icons = {
  // Navigation and actions
  external: Launch,
  search: Search,
  close: Close,
  expand: ChevronDown,
  listView: List,
  graphView: ChartNetwork,
  exportFile: Download,
  importFile: Upload,
  run: Play,
  stop: Stop,
  // Catalog maturity
  ready: CircleFilled,
  // Learner states (LEARNING_MODEL.md), each paired with a text label
  unassessed: CircleDash,
  gap: Incomplete,
  learning: InProgress,
  demonstrated: CheckmarkOutline,
  transferred: ArrowRight,
  retained: Renew,
  applied: CheckmarkFilled,
  // Lab results
  pass: CheckmarkFilled,
  fail: ErrorFilled,
} as const;

export type IconName = keyof typeof icons;
