"use server";
import { refresh } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, follows, user as userTable } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function setFollow(targetId, follow) {
  const me = await requireUser();
  const target = z.string().min(1).parse(targetId);
  if (target === me.id) throw new Error("You can't follow yourself");

  await db.transaction(async (tx) => {
    if (!follow) {
      await tx.delete(follows).where(and(eq(follows.followerId, me.id), eq(follows.followingId, target)));
      return;
    }
    const [t] = await tx.select({ username: userTable.username }).from(userTable).where(eq(userTable.id, target));
    if (!t) throw new Error("User not found");
    const inserted = await tx
      .insert(follows)
      .values({ followerId: me.id, followingId: target })
      .onConflictDoNothing()
      .returning();
    if (inserted.length) {
      await tx.insert(activities).values({
        userId: me.id,
        type: "followed",
        payload: { userId: target, username: t.username },
      });
    }
  });
  refresh();
}
