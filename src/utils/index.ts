export function unknownToError(err: unknown): Error {
  if (err instanceof Error) return err;

  if (!err) return new Error();

  const message = typeof err === "string" ? err : JSON.stringify(err);

  return new Error(message);
}
