// The only import of the icon library. Components use these semantic names, so an
// icon means the same thing everywhere (DESIGN.md → Icons). Library: Phosphor, light
// weight. Hand-written SVG is rejected by scripts/check-icons.mjs outside src/components/plate/.
import { createElement } from "react";
import { siZalo } from "simple-icons";
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsLeftRightIcon,
  ArrowUpRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  CircleHalfIcon,
  ClockCounterClockwiseIcon,
  CodeIcon,
  EnvelopeSimpleIcon,
  DownloadSimpleIcon,
  EyeIcon,
  GithubLogoIcon,
  GridFourIcon,
  LinkedinLogoIcon,
  LinkSimpleIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
  StopIcon,
  TimerIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  WhatsappLogoIcon,
  WrenchIcon,
  XCircleIcon,
  XIcon,
  XLogoIcon,
} from "@phosphor-icons/react";

export const ICON_WEIGHT = "light" as const;

// Zalo is the one brand here that Phosphor does not carry, and it has no glyph mark to
// compress: its logo is the wordmark. The geometry is simple-icons' official asset, drawn in
// currentColor so it sits in the row with the others. Nothing about it is drawn by hand.
function ZaloLogoIcon({ size = 16, className }: { size?: number; weight?: string; className?: string }) {
  return createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "currentColor",
      "aria-hidden": true,
      focusable: "false",
      className,
    },
    createElement("path", { d: siZalo.path }),
  );
}

export const icons = {
  // Navigation and actions
  external: ArrowUpRightIcon,
  forward: ArrowRightIcon,
  back: ArrowLeftIcon,
  search: MagnifyingGlassIcon,
  close: XIcon,
  menu: ListIcon,
  expand: CaretDownIcon,
  listView: ListIcon,
  plateView: GridFourIcon,
  copyLink: LinkSimpleIcon,
  add: PlusIcon,
  exportFile: DownloadSimpleIcon,
  importFile: UploadSimpleIcon,
  run: PlayIcon,
  stop: StopIcon,
  // Learner states (docs/LEARNING_MODEL.md), each paired with a text label
  unassessed: CircleDashedIcon,
  gap: CircleHalfIcon,
  learning: CircleHalfIcon,
  demonstrated: CheckCircleIcon,
  transferred: ArrowsLeftRightIcon,
  retained: ClockCounterClockwiseIcon,
  applied: WrenchIcon,
  // Lab results
  pass: CheckCircleIcon,
  fail: XCircleIcon,
  error: WarningCircleIcon,
  timeout: TimerIcon,
  // Owner links in the frame (site.links in the content model)
  github: GithubLogoIcon,
  email: EnvelopeSimpleIcon,
  whatsapp: WhatsappLogoIcon,
  zalo: ZaloLogoIcon,
  x: XLogoIcon,
  linkedin: LinkedinLogoIcon,
  star: StarIcon,
  // Labs
  code: CodeIcon,
  reveal: EyeIcon,
  reset: ArrowCounterClockwiseIcon,
} as const;

export type IconName = keyof typeof icons;
