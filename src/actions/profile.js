"use server";
import { headers } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { isDefaultAvatar } from "@/lib/avatars";

const input = z.object({
  name: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500).optional(),
  // Own https image, one of the built-in avatars, or "" for the automatic default.
  image: z
    .union([
      z.url({ protocol: /^https$/ }).max(500),
      z.string().refine(isDefaultAvatar, "Unknown avatar"),
      z.literal(""),
    ])
    .optional(),
});

export async function updateProfile(_prev, formData) {
  await requireUser();
  const parsed = input.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    image: formData.get("image") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, bio, image } = parsed.data;
  await getAuth().api.updateUser({
    headers: await headers(),
    body: { name, bio: bio || null, image: image || null },
  });
  refresh();
  return { ok: Date.now() };
}
