// The only import of the icon library. Components use these semantic names, so an
// icon means the same thing everywhere (DESIGN.md → Icons). Library: Phosphor, light
// weight. Hand-written SVG is rejected by scripts/check-icons.mjs outside src/components/plate/.
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ArrowsLeftRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  CircleHalfIcon,
  ClockCounterClockwiseIcon,
  CodeIcon,
  DownloadSimpleIcon,
  EyeIcon,
  GridFourIcon,
  LinkSimpleIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PlusIcon,
  StopIcon,
  TimerIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  WrenchIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

export const ICON_WEIGHT = "light" as const;

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
  // Labs
  code: CodeIcon,
  reveal: EyeIcon,
  reset: ArrowCounterClockwiseIcon,
} as const;

export type IconName = keyof typeof icons;
