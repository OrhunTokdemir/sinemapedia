import { notFound } from "next/navigation";

/** Parse a positive integer route param or 404. */
export function intParam(value, { min = 1 } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) notFound();
  return n;
}
