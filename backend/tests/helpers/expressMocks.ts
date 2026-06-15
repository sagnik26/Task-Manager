import type { NextFunction, Request, Response } from "express";

export type MockResponse = {
  statusCode: number;
  body: unknown;
  headersSent: boolean;
  status: (code: number) => MockResponse;
  json: (body: unknown) => MockResponse;
};

export function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    headersSent: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };

  return res;
}

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    headers: {},
    cookies: {},
    path: "/test",
    method: "GET",
    ...overrides,
  } as Request;
}

export function createMockNext(): NextFunction & { calls: number } {
  const next = ((..._args: unknown[]) => {
    next.calls += 1;
  }) as NextFunction & { calls: number };
  next.calls = 0;
  return next;
}

export function asResponse(mock: MockResponse): Response {
  return mock as unknown as Response;
}
