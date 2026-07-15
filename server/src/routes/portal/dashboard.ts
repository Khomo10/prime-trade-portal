import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, portalMembersTable, portalTradingStatsTable, portalActivityItemsTable } from "../db";
import {
  GetDashboardResponse,
  GetActivityResponse,
} from "../zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

// GET /portal/dashboard
router.get("/portal/dashboard", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  let [member] = await db
    .select()
    .from(portalMembersTable)
    .where(eq(portalMembersTable.clerkId, clerkId));

  if (!member) {
    // JIT provision
    [member] = await db
      .insert(portalMembersTable)
      .values({ clerkId, displayName: "New Member", memberType: "retail" })
      .returning();
  }

  let [stats] = await db
    .select()
    .from(portalTradingStatsTable)
    .where(eq(portalTradingStatsTable.memberId, member.id));

  if (!stats) {
    // Seed starter stats for new members
    const starterCurve = buildStarterCurve(100000);
    [stats] = await db
      .insert(portalTradingStatsTable)
      .values({
        memberId: member.id,
        portfolioValueZar: "100000.00",
        totalPnlZar: "0.00",
        totalPnlPct: "0.0000",
        winRate: "0.0000",
        openPositions: 0,
        totalTrades: 0,
        monthlyPnlZar: "0.00",
        equityCurve: starterCurve,
      })
      .returning();
  }

  const equityCurve = Array.isArray(stats.equityCurve)
    ? (stats.equityCurve as Array<{ date: string; valueZar: number }>)
    : [];

  res.json(GetDashboardResponse.parse({
    portfolioValueZar: Number(stats.portfolioValueZar),
    totalPnlZar: Number(stats.totalPnlZar),
    totalPnlPct: Number(stats.totalPnlPct),
    winRate: Number(stats.winRate),
    openPositions: stats.openPositions,
    totalTrades: stats.totalTrades,
    monthlyPnlZar: Number(stats.monthlyPnlZar),
    equityCurve,
  }));
});

// GET /portal/activity
router.get("/portal/activity", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  let [member] = await db
    .select()
    .from(portalMembersTable)
    .where(eq(portalMembersTable.clerkId, clerkId));

  if (!member) {
    res.json(GetActivityResponse.parse([]));
    return;
  }

  const items = await db
    .select()
    .from(portalActivityItemsTable)
    .where(eq(portalActivityItemsTable.memberId, member.id))
    .orderBy(desc(portalActivityItemsTable.occurredAt))
    .limit(20);

  res.json(GetActivityResponse.parse(
    items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      occurredAt: item.occurredAt.toISOString(),
    }))
  ));
});

// Build a 90-day flat equity curve for new members
function buildStarterCurve(startValue: number) {
  const curve = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    curve.push({
      date: d.toISOString().slice(0, 10),
      valueZar: startValue,
    });
  }
  return curve;
}

export default router;
