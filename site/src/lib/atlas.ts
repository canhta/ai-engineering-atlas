// Typed access to the generated atlas data (scripts/build_site_data.py).
import atlas from "../data/atlas.json";

export interface Competency {
  id: string;
  title: string;
  domain: string;
  status: "coverage" | "ready";
  route?: string;
}

export interface SourceRef {
  source: string;
  locator?: string;
  purpose?: string;
}

export interface Route {
  id: string;
  title: string;
  domain: string;
  status: string;
  path: string;
  competency_types: string[];
  target_level: string;
  target_states: string[];
  why: string;
  prerequisites: string[];
  prerequisite_support?: Record<string, SourceRef & { diagnostic?: string }>;
  outcomes: string[];
  diagnostic: { tasks: string[]; pass_condition: string };
  learning_route: {
    mental_model?: SourceRef[];
    guided_practice?: { task: string }[];
    independent_practice?: { artifact?: string; task: string }[];
  };
  experiments?: string[];
  exit_evidence: string[];
  transfer?: { task: string };
}

export interface ResolvedSource {
  title: string;
  url: string;
  host: string;
}

export const REPO_URL = "https://github.com/canhta/ai-engineering-atlas";

export const domains = atlas.domains;
export const competencies = atlas.competencies as Competency[];
export const routes = atlas.routes as unknown as Record<string, Route>;
export const labs = atlas.labs;
export const projects = atlas.projects;
export const levels = atlas.levels as Record<string, string>;

const byId = new Map(competencies.map((c) => [c.id, c]));
export const competency = (id: string) => byId.get(id);

export const readyCompetencies = competencies.filter((c) => c.status === "ready" && routes[c.id]);

export function resolveSource(source: string): ResolvedSource {
  const isUrl = /^https?:\/\//.test(source);
  const entry = isUrl ? undefined : (atlas.resources as Record<string, { title: string; url: string }>)[source];
  const url = isUrl ? source : entry?.url ?? "";
  return { title: entry?.title ?? source, url, host: url ? new URL(url).hostname.replace(/^www\./, "") : "" };
}

export function labFor(routeId: string) {
  return labs.find((lab) => lab.competencies.includes(routeId));
}

export const repoUrl = (path: string) => `${REPO_URL}/tree/main/${path}`;
