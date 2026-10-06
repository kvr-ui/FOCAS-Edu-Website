import { afterEach, describe, expect, it, vi } from "vitest";
import type { ServiceEnv } from "../src/types.js";
import { buildPreviewUrls, getPreviewUrl } from "../src/vercel.js";
import { StateStore } from "../src/state.js";
import { testConfig } from "./helpers.js";

function serviceEnv(overrides: Parameters<typeof testConfig>[0] = {}): ServiceEnv {
  const config = testConfig(overrides);
  return { config, state: new StateStore(config.stateDir), report: async () => undefined };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("getPreviewUrl", () => {
  it("retries until READY and prefers the branch alias", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ deployments: [] }))
      .mockResolvedValueOnce(jsonResponse({
        deployments: [{
          uid: "dpl_1",
          state: "BUILDING",
          url: "focas-random.vercel.app",
          inspectorUrl: "https://vercel.com/acme/focas/dpl_1",
          meta: { githubCommitSha: "abc123", githubCommitRef: "lp/course-page" },
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        deployments: [{
          uid: "dpl_1",
          state: "READY",
          url: "focas-random.vercel.app",
          alias: ["focas-git-lp-course-page-acme.vercel.app"],
          inspectorUrl: "https://vercel.com/acme/focas/dpl_1",
          meta: { githubCommitSha: "abc123", githubCommitRef: "lp/course-page" },
        }],
      }));

    const resultPromise = getPreviewUrl("abc123", "lp/course-page", serviceEnv({ vercelTeamId: "team_1" }), {
      fetch: fetchMock,
      pollIntervalMs: 5_000,
      timeoutMs: 30_000,
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(resultPromise).resolves.toEqual({
      status: "ready",
      url: "https://focas-git-lp-course-page-acme.vercel.app",
      inspectorUrl: "https://vercel.com/acme/focas/dpl_1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const listUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(listUrl.pathname).toBe("/v6/deployments");
    expect(listUrl.searchParams.get("projectId")).toBe("prj_test");
    expect(listUrl.searchParams.get("teamId")).toBe("team_1");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ headers: { Authorization: "Bearer vt" } });
  });

  it.each(["ERROR", "CANCELED"])("returns the build-log tail for %s", async (state) => {
    const oldLines = Array.from({ length: 35 }, (_, index) => ({
      created: index,
      payload: { text: `line ${index}` },
    }));
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({
        deployments: [{
          uid: "dpl_failed",
          state,
          inspectorUrl: "https://vercel.com/acme/focas/dpl_failed",
          meta: { githubCommitSha: "badsha" },
        }],
      }))
      .mockResolvedValueOnce(jsonResponse(oldLines.reverse()));

    const result = await getPreviewUrl("badsha", "lp/broken", serviceEnv(), { fetch: fetchMock });

    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("expected an error result");
    expect(result.inspectorUrl).toBe("https://vercel.com/acme/focas/dpl_failed");
    expect(result.logTail).not.toContain("line 4\n");
    expect(result.logTail).toContain("line 5");
    expect(result.logTail).toContain("line 34");
    const eventsUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(eventsUrl.pathname).toBe("/v3/deployments/dpl_failed/events");
    expect(eventsUrl.searchParams.get("direction")).toBe("backward");
  });

  it("returns a still-building timeout with the known inspector URL", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      deployments: [{
        uid: "dpl_slow",
        readyState: "BUILDING",
        inspectorUrl: "https://vercel.com/acme/focas/dpl_slow",
        meta: { githubCommitSha: "slowsha" },
      }],
    }));
    const resultPromise = getPreviewUrl("slowsha", "lp/slow", serviceEnv(), {
      fetch: fetchMock,
      pollIntervalMs: 5_000,
      timeoutMs: 12_000,
    });
    await vi.advanceTimersByTimeAsync(12_000);

    await expect(resultPromise).resolves.toEqual({
      status: "timeout",
      message: 'Vercel preview for branch "lp/slow" is still building after 12 seconds.',
      inspectorUrl: "https://vercel.com/acme/focas/dpl_slow",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns a clear timeout when the deployment was never created", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ deployments: [] }));
    const resultPromise = getPreviewUrl("missing", "lp/missing", serviceEnv(), {
      fetch: fetchMock,
      pollIntervalMs: 2_000,
      timeoutMs: 5_000,
    });
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(resultPromise).resolves.toMatchObject({
      status: "timeout",
      message: expect.stringContaining("No Vercel deployment was found for commit missing"),
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("turns authentication failures into a clear result", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: { code: "forbidden", message: "Token scope is invalid" },
    }, 403));

    await expect(getPreviewUrl("abc", "lp/page", serviceEnv(), { fetch: fetchMock })).resolves.toEqual({
      status: "error",
      logTail: expect.stringMatching(/authentication failed \(403\).*VERCEL_TOKEN.*Token scope is invalid/),
    });
  });
});

describe("buildPreviewUrls", () => {
  it("builds page, success and named variant URLs", () => {
    expect(buildPreviewUrls("focas-preview.vercel.app/", "ca-course", ["parents", "repeaters"])).toEqual({
      pageUrl: "https://focas-preview.vercel.app/ca-course",
      successUrl: "https://focas-preview.vercel.app/ca-course-success",
      variantUrls: {
        parents: "https://focas-preview.vercel.app/ca-course?v=parents",
        repeaters: "https://focas-preview.vercel.app/ca-course?v=repeaters",
      },
    });
  });
});
