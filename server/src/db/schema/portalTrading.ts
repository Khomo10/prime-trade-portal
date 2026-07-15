import { pgTable, serial, integer, numeric, timestamp, text, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalTradingStatsTable = pgTable("portal_trading_stats", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().unique(),
  portfolioValueZar: numeric("portfolio_value_zar", { precision: 15, scale: 2 }).notNull().default("0"),
  totalPnlZar: numeric("total_pnl_zar", { precision: 15, scale: 2 }).notNull().default("0"),
  totalPnlPct: numeric("total_pnl_pct", { precision: 8, scale: 4 }).notNull().default("0"),
  winRate: numeric("win_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  openPositions: integer("open_positions").notNull().default(0),
  totalTrades: integer("total_trades").notNull().default(0),
  monthlyPnlZar: numeric("monthly_pnl_zar", { precision: 15, scale: 2 }).notNull().default("0"),
  equityCurve: jsonb("equity_curve").notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const portalActivityItemsTable = pgTable("portal_activity_items", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortalTradingStatsSchema = createInsertSchema(portalTradingStatsTable).omit({ id: true, updatedAt: true });
export type InsertPortalTradingStats = z.infer<typeof insertPortalTradingStatsSchema>;
export type PortalTradingStats = typeof portalTradingStatsTable.$inferSelect;

export const insertPortalActivityItemSchema = createInsertSchema(portalActivityItemsTable).omit({ id: true });
export type InsertPortalActivityItem = z.infer<typeof insertPortalActivityItemSchema>;
export type PortalActivityItem = typeof portalActivityItemsTable.$inferSelect;
