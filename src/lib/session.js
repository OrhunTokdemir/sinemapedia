import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

export async function getSession() {
  // Read headers first: it marks this as request-time work, so prerendering never initializes auth.
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
