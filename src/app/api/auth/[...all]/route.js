import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

let handlers;
const h = () => (handlers ??= toNextJsHandler(getAuth()));

export const GET = (request) => h().GET(request);
export const POST = (request) => h().POST(request);
