import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, portalMembersTable, portalTradingStatsTable } from "../db";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetMyRankResponse,
} from "../zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

// GET /portal/leaderboard
router.get("/portal/leaderboard", async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string | undefined;

  const qParams = GetLeaderboardQueryParams.safeParse(req.query);
  const period = qParams.success ? (qParams.data.period ?? "monthly") : "monthly";

  let currentMemberId: number | null = null;
  if (clerkId) {
    const [m] = await db.select().from(portalMembersTable).where(eq(portalMembersTable.clerkId, clerkId));
    if (m) currentMemberId = m.id;
  }

  // Join members + stats, sort by pnl
  const rows = await db
    .select({
      memberId: portalMembersTable.id,
      displayName: portalMembersTable.displayName,
      avatarUrl: portalMembersTable.avatarUrl,
      pnlZar: portalTradingStatsTable.totalPnlZar,
      pnlPct: portalTradingStatsTable.totalPnlPct,
      winRate: portalTradingStatsTable.winRate,
      totalTrades: portalTradingStatsTable.totalTrades,
      monthlyPnlZar: portalTradingStatsTable.monthlyPnlZar,
    })
    .from(portalTradingStatsTable)
    .innerJoin(portalMembersTable, eq(portalTradingStatsTable.memberId, portalMembersTable.id))
    .orderBy(desc(
      period === "monthly"
        ? portalTradingStatsTable.monthlyPnlZar
        : portalTradingStatsTable.totalPnlZar
    ))
    .limit(50);

  const pnlField = (row: typeof rows[0]) =>
    period === "monthly" ? Number(row.monthlyPnlZar) : Number(row.pnlZar);

  res.json(GetLeaderboardResponse.parse(rows.map((row, i) => ({
    rank: i + 1,
    memberId: row.memberId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? null,
    pnlZar: pnlField(row),
    pnlPct: Number(row.pnlPct),
    winRate: Number(row.winRate),
    totalTrades: row.totalTrades,
    badge: getBadge(i + 1),
    isCurrentUser: currentMemberId !== null && row.memberId === currentMemberId,
  }))));
});

// GET /portal/leaderboard/me
router.get("/portal/leaderboard/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  let [member] = await db
    .select()
    .from(portalMembersTable)
    .where(eq(portalMembersTable.clerkId, clerkId));

  if (!member) {
    [member] = await db
      .insert(portalMembersTable)
      .values({ clerkId, displayName: "New Member", memberType: "retail" })
      .returning();
  }

  // Get all stats sorted to find rank
  const rows = await db
    .select({
      memberId: portalMembersTable.id,
      displayName: portalMembersTable.displayName,
      avatarUrl: portalMembersTable.avatarUrl,
      pnlZar: portalTradingStatsTable.totalPnlZar,
      pnlPct: portalTradingStatsTable.totalPnlPct,
      winRate: portalTradingStatsTable.winRate,
      totalTrades: portalTradingStatsTable.totalTrades,
      monthlyPnlZar: portalTradingStatsTable.monthlyPnlZar,
    })
    .from(portalTradingStatsTable)
    .innerJoin(portalMembersTable, eq(portalTradingStatsTable.memberId, portalMembersTable.id))
    .orderBy(desc(portalTradingStatsTable.totalPnlZar));

  const myIndex = rows.findIndex((r) => r.memberId === member!.id);

  if (myIndex === -1) {
    // Member has no stats yet — return rank 0 placeholder
    res.json(GetMyRankResponse.parse({
      rank: rows.length + 1,
      memberId: member.id,
      displayName: member.displayName,
      avatarUrl: member.avatarUrl ?? null,
      pnlZar: 0,
      pnlPct: 0,
      winRate: 0,
      totalTrades: 0,
      badge: "none",
      isCurrentUser: true,
    }));
    return;
  }

  const row = rows[myIndex];
  res.json(GetMyRankResponse.parse({
    rank: myIndex + 1,
    memberId: row.memberId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? null,
    pnlZar: Number(row.pnlZar),
    pnlPct: Number(row.pnlPct),
    winRate: Number(row.winRate),
    totalTrades: row.totalTrades,
    badge: getBadge(myIndex + 1),
    isCurrentUser: true,
  }));
});

function getBadge(rank: number): "gold" | "silver" | "bronze" | "top10" | "none" {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  if (rank <= 10) return "top10";
  return "none";
}

export default router;
