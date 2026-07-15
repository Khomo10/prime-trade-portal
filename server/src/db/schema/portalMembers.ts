import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalMembersTable = pgTable("portal_members", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  memberType: text("member_type").notNull().default("retail"),
  country: text("country"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPortalMemberSchema = createInsertSchema(portalMembersTable).omit({ id: true, joinedAt: true, updatedAt: true });
export type InsertPortalMember = z.infer<typeof insertPortalMemberSchema>;
export type PortalMember = typeof portalMembersTable.$inferSelect;
