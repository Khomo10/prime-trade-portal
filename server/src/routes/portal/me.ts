import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, portalMembersTable } from "../db";
import {
  GetMeResponse,
  UpdateMeBody,
  UpdateMeResponse,
} from "../zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

// GET /portal/me — JIT-provision member on first call
router.get("/portal/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  let [member] = await db
    .select()
    .from(portalMembersTable)
    .where(eq(portalMembersTable.clerkId, clerkId));

  if (!member) {
    // JIT provision: create a member record for this Clerk user
    [member] = await db
      .insert(portalMembersTable)
      .values({
        clerkId,
        displayName: "New Member",
        memberType: "retail",
      })
      .returning();
  }

  res.json(GetMeResponse.parse({
    id: member.id,
    clerkId: member.clerkId,
    displayName: member.displayName,
    avatarUrl: member.avatarUrl ?? null,
    bio: member.bio ?? null,
    memberType: member.memberType,
    country: member.country ?? null,
    joinedAt: member.joinedAt.toISOString(),
  }));
});

// PATCH /portal/me
router.patch("/portal/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined) updates.displayName = parsed.data.displayName;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.country !== undefined) updates.country = parsed.data.country;

  const [updated] = await db
    .update(portalMembersTable)
    .set(updates)
    .where(eq(portalMembersTable.clerkId, clerkId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.json(UpdateMeResponse.parse({
    id: updated.id,
    clerkId: updated.clerkId,
    displayName: updated.displayName,
    avatarUrl: updated.avatarUrl ?? null,
    bio: updated.bio ?? null,
    memberType: updated.memberType,
    country: updated.country ?? null,
    joinedAt: updated.joinedAt.toISOString(),
  }));
});

export default router;
