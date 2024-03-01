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
    redirect() { return undefined; },
    locals: locals || {},
  } as unknown as Response;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const next = (_v?: unknown) => undefined;

  return { req, res, next };
}

export const winstonMock = {
  child() { return this; },
  fatal() { return; },
  error() { return; },
  warn() { return; },
  info() { return; },
  debug() { return; },
  trace() { return; },
};

export const errorMock = {
  unknownToError(err: string | Error) { return typeof err === "string" ? new Error(err) : err; },
  BadRequest() { return new Error("Mocked Bad Request"); },
  Unauthorized() { return new Error("Mocked Unauthorized"); },
  Forbidden() { return new Error("Mocked Forbidden"); },
  NotFound() { return new Error("Mocked Not Found"); },
  Conflict() { return new Error("Mocked Conflict"); },
  InternalServerError() { return new Error("Mocked Internal Server Error"); },
};
