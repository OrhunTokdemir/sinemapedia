import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAuth } from "./auth";

export async function getSession() {
  // Session checks are always per-request (Better Auth uses the clock and crypto to validate
  // sessions), so opt out of every prerender pass, including header-aware prefetch renders.
  await connection();
  const h = await headers();
  return getAuth().api.getSession({ headers: h });
}

export async function getUser() {
  return (await getSession())?.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
