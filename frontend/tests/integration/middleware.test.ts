import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { middleware } from "../../src/middleware";

describe("middleware", () => {
  const originalBackend = process.env.BACKEND_PROXY_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalBackend === undefined) {
      delete process.env.BACKEND_PROXY_URL;
    } else {
      process.env.BACKEND_PROXY_URL = originalBackend;
    }
  });

  it("passes through when BACKEND_PROXY_URL is not configured", async () => {
    delete process.env.BACKEND_PROXY_URL;

    const request = new NextRequest(
      "https://app.example.com/api/tasks?status=todo",
    );
    const response = await middleware(request);

    expect(response?.status).toBe(200);
    expect(response?.headers.get("x-middleware-next")).toBe("1");
  });

  it("proxies /api requests to the configured backend", async () => {
    process.env.BACKEND_PROXY_URL = "https://api.example.com/";
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest(
      "https://app.example.com/api/tasks?status=todo",
      {
        method: "GET",
        headers: { authorization: "Bearer token" },
      },
    );

    const response = await middleware(request);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [target, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(target).toBe("https://api.example.com/tasks?status=todo");
    expect(init.method).toBe("GET");
    expect((init.headers as Headers).get("authorization")).toBe("Bearer token");
    expect((init.headers as Headers).has("host")).toBe(false);
    expect(response?.status).toBe(200);
  });

  it("forwards request bodies for non-GET methods", async () => {
    process.env.BACKEND_PROXY_URL = "https://api.example.com";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("https://app.example.com/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New task" }),
      headers: { "content-type": "application/json" },
    });

    await middleware(request);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBeDefined();
  });
});
