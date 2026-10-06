import type { ServiceEnv } from "./types.js";

const VERCEL_API = "https://api.vercel.com";
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_TIMEOUT_MS = 5 * 60_000;
const LOG_TAIL_LINES = 30;
const LOG_TAIL_CHARS = 3_500;

export type PreviewResult =
  | { status: "ready"; url: string; inspectorUrl?: string }
  | { status: "error"; logTail: string; inspectorUrl?: string }
  | { status: "timeout"; message: string; inspectorUrl?: string };

export interface PreviewLookupOptions {
  /** Injectable so tests do not wait five seconds between API calls. */
  pollIntervalMs?: number;
  /** Injectable so tests do not wait five minutes for the timeout path. */
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}

export type GetPreviewUrl = (
  commitSha: string,
  branch: string,
  env: ServiceEnv,
  options?: PreviewLookupOptions,
) => Promise<PreviewResult>;

interface VercelDeployment {
  uid?: string;
  id?: string;
  url?: string | null;
  state?: string;
  readyState?: string;
  inspectorUrl?: string;
  alias?: string | string[];
  aliases?: string[];
  meta?: Record<string, unknown>;
}

interface VercelEvent {
  created?: number;
  text?: string;
  payload?: { text?: string };
}

type ApiResult = { ok: true; data: unknown } | { ok: false; message: string };

/** URLs sent with a completed preview. Variant keys are retained for useful labels. */
export interface PreviewUrls {
  pageUrl: string;
  successUrl: string;
  variantUrls: Record<string, string>;
}

export function buildPreviewUrls(previewUrl: string, slug: string, variants: readonly string[] = []): PreviewUrls {
  const origin = `https://${previewUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}`;
  const pageUrl = `${origin}/${encodeURIComponent(slug)}`;

  return {
    pageUrl,
    successUrl: `${origin}/${encodeURIComponent(`${slug}-success`)}`,
    variantUrls: Object.fromEntries(variants.map((variant) => [variant, `${pageUrl}?v=${encodeURIComponent(variant)}`])),
  };
}

function apiUrl(path: string, teamId?: string, params: Record<string, string> = {}): string {
  const url = new URL(path, VERCEL_API);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (teamId) url.searchParams.set("teamId", teamId);
  return url.toString();
}

function errorDetail(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const error = (value as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return undefined;
  const message = (error as { message?: unknown }).message;
  const code = (error as { code?: unknown }).code;
  if (typeof message === "string") return message;
  if (typeof code === "string") return code;
  return undefined;
}

async function requestJson(fetchImpl: typeof globalThis.fetch, url: string, token: string): Promise<ApiResult> {
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }

    if (response.ok) return { ok: true, data };

    const detail = errorDetail(data);
    const suffix = detail ? ` ${detail}` : "";
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message: `Vercel API authentication failed (${response.status}). Check VERCEL_TOKEN and VERCEL_TEAM_ID access.${suffix}`,
      };
    }
    return { ok: false, message: `Vercel API request failed (${response.status}).${suffix}` };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Could not reach the Vercel API: ${detail}` };
  }
}

function deploymentState(deployment: VercelDeployment): string {
  return (deployment.state ?? deployment.readyState ?? "").toUpperCase();
}

function matchingDeployment(data: unknown, commitSha: string, branch: string): VercelDeployment | undefined {
  if (!data || typeof data !== "object") return undefined;
  const deployments = (data as { deployments?: unknown }).deployments;
  if (!Array.isArray(deployments)) return undefined;

  const matches = deployments.filter((candidate): candidate is VercelDeployment => {
    if (!candidate || typeof candidate !== "object") return false;
    return (candidate as VercelDeployment).meta?.githubCommitSha === commitSha;
  });
  return matches.find((candidate) => candidate.meta?.githubCommitRef === branch) ?? matches[0];
}

function host(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function readyUrl(deployment: VercelDeployment, branch: string): string | undefined {
  const aliases = [
    ...(typeof deployment.alias === "string" ? [deployment.alias] : (deployment.alias ?? [])),
    ...(deployment.aliases ?? []),
  ].filter((alias): alias is string => typeof alias === "string" && alias.length > 0);
  const branchLabel = branch.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const branchAlias = aliases.find((alias) => host(alias).toLowerCase().includes(branchLabel))
    ?? (aliases.length === 1 ? aliases[0] : undefined);
  const selected = branchAlias ?? deployment.url ?? undefined;
  return selected ? `https://${host(selected)}` : undefined;
}

function eventText(event: VercelEvent): string | undefined {
  return typeof event.payload?.text === "string"
    ? event.payload.text
    : typeof event.text === "string"
      ? event.text
      : undefined;
}

function tailText(text: string): string {
  const byLines = text.split("\n").slice(-LOG_TAIL_LINES).join("\n");
  return byLines.length <= LOG_TAIL_CHARS ? byLines : byLines.slice(-LOG_TAIL_CHARS);
}

async function getLogTail(
  deployment: VercelDeployment,
  env: ServiceEnv,
  fetchImpl: typeof globalThis.fetch,
): Promise<string> {
  const id = deployment.uid ?? deployment.id;
  const state = deploymentState(deployment) || "FAILED";
  if (!id) return `Vercel deployment ended in ${state}, but its build log could not be requested (missing deployment ID).`;

  const result = await requestJson(
    fetchImpl,
    apiUrl(`/v3/deployments/${encodeURIComponent(id)}/events`, env.config.vercelTeamId, {
      direction: "backward",
      limit: "100",
    }),
    env.config.vercelToken,
  );
  if (!result.ok) return `Vercel deployment ended in ${state}. ${result.message}`;
  if (!Array.isArray(result.data)) return `Vercel deployment ended in ${state}. No build log was returned.`;

  const events = (result.data as VercelEvent[]).slice().sort((a, b) => (a.created ?? 0) - (b.created ?? 0));
  const log = events.map(eventText).filter((line): line is string => Boolean(line)).join("\n").trim();
  return log ? tailText(log) : `Vercel deployment ended in ${state}. No build log was available.`;
}

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Poll Vercel until the exact Git commit is ready or reaches a terminal outcome. */
export const getPreviewUrl: GetPreviewUrl = async (commitSha, branch, env, options = {}) => {
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const deadline = Date.now() + timeoutMs;
  let firstPoll = true;
  let lastDeployment: VercelDeployment | undefined;

  while (firstPoll || Date.now() < deadline) {
    firstPoll = false;
    const result = await requestJson(
      fetchImpl,
      apiUrl("/v6/deployments", env.config.vercelTeamId, {
        projectId: env.config.vercelProjectId,
        limit: "100",
      }),
      env.config.vercelToken,
    );
    if (!result.ok) return { status: "error", logTail: result.message };

    const deployment = matchingDeployment(result.data, commitSha, branch);
    if (deployment) {
      lastDeployment = deployment;
      const state = deploymentState(deployment);
      if (state === "READY") {
        const url = readyUrl(deployment, branch);
        if (!url) {
          return {
            status: "error",
            logTail: "Vercel reported the deployment as READY but did not return a deployment URL.",
            ...(deployment.inspectorUrl ? { inspectorUrl: deployment.inspectorUrl } : {}),
          };
        }
        return {
          status: "ready",
          url,
          ...(deployment.inspectorUrl ? { inspectorUrl: deployment.inspectorUrl } : {}),
        };
      }

      if (["ERROR", "CANCELED", "CANCELLED", "BLOCKED"].includes(state)) {
        return {
          status: "error",
          logTail: await getLogTail(deployment, env, fetchImpl),
          ...(deployment.inspectorUrl ? { inspectorUrl: deployment.inspectorUrl } : {}),
        };
      }
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await delay(Math.min(pollIntervalMs, remaining));
  }

  const inspectorUrl = lastDeployment?.inspectorUrl;
  const message = lastDeployment
    ? `Vercel preview for branch "${branch}" is still building after ${Math.ceil(timeoutMs / 1_000)} seconds.`
    : `No Vercel deployment was found for commit ${commitSha} on branch "${branch}" after ${Math.ceil(timeoutMs / 1_000)} seconds.`;
  return {
    status: "timeout",
    message,
    ...(inspectorUrl ? { inspectorUrl } : {}),
  };
};
