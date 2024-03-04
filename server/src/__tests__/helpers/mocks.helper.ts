import { Request, Response } from "express";

export function expressMock({
  body,
  query,
  params,
  headers,
  baseUrl,
  path,
  locals,
}: Partial<{
  body: object,
  query: object,
  params: object,
  headers: object,
  baseUrl: string,
  path: string,
  locals: object,
}> = {}) {
  const req = {
    body,
    query,
    params,
    headers,
    baseUrl,
    path,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as unknown as Request<any, any, any, any>;
  const res = {
    json() { return this; },
    status() { return this; },
    setHeader() { return this; },
    locals: locals || {},
    send() { return this; },
  } as unknown as Response;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const next = (_v?: unknown) => undefined;

  return { req, res, next };
}
