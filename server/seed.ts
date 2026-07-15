import { db } from "./src/db/index";
import { portalMembersTable, portalCoursesTable, portalLessonsTable, portalLessonCompletionsTable, portalTradingStatsTable, portalActivityItemsTable } from "./src/db/schema/index";

async function seed() {
  console.log("Seeding PrimeTrade portal data…");

  // ── Courses ────────────────────────────────────────────────────────────
  const courseData = [
    {
      title: "Foundations of Forex Trading",
      description: "Learn the fundamentals of the foreign exchange market. Covers currency pairs, pip values, lot sizes, and how the forex market operates in the South African context.",
      level: "beginner",
      category: "Forex",
      coverEmoji: "💱",
      durationMinutes: 95,
    },
    {
      title: "Technical Analysis Essentials",
      description: "Master chart patterns, support and resistance, moving averages, RSI, MACD, and Bollinger Bands. Build a repeatable framework for reading price action.",
      level: "beginner",
      category: "Technical Analysis",
      coverEmoji: "📊",
      durationMinutes: 120,
    },
    {
      title: "Risk Management & Position Sizing",
      description: "Protect your capital with professional risk management techniques. Understand R:R ratios, max drawdown rules, position sizing formulas, and account preservation.",
      level: "intermediate",
      category: "Risk Management",
      coverEmoji: "🛡️",
      durationMinutes: 80,
    },
    {
      title: "Trading the JSE & Indices",
      description: "Specialised course on trading South African equities and global indices. Covers the JSE Top 40, sector rotation, earnings plays, and index CFDs.",
      level: "intermediate",
      category: "Equities",
      coverEmoji: "📈",
      durationMinutes: 110,
    },
    {
      title: "Advanced Price Action Strategies",
      description: "Go beyond indicators. Learn institutional order flow, market structure shifts, liquidity sweeps, and how smart money moves price on higher timeframes.",
      level: "advanced",
      category: "Price Action",
      coverEmoji: "🔍",
      durationMinutes: 150,
    },
    {
      title: "Trading Psychology & Discipline",
      description: "Overcome emotional trading, FOMO, and revenge trading. Build a process-driven mindset, journaling habits, and the mental fortitude required for consistent performance.",
      level: "intermediate",
      category: "Psychology",
      coverEmoji: "🧠",
      durationMinutes: 70,
    },
  ];

  const insertedCourses = await db.insert(portalCoursesTable).values(courseData).returning();
  console.log(`Inserted ${insertedCourses.length} courses`);

  // ── Lessons ────────────────────────────────────────────────────────────
  const lessonsByCourse: Record<number, Array<{ title: string; durationMinutes: number; type: string }>> = {
    0: [ // Foundations of Forex
      { title: "How the Forex Market Works", durationMinutes: 12, type: "video" },
      { title: "Major, Minor & Exotic Pairs", durationMinutes: 10, type: "article" },
      { title: "Understanding Pips and Lot Sizes", durationMinutes: 15, type: "video" },
      { title: "Reading a Forex Quote", durationMinutes: 8, type: "article" },
      { title: "Forex Market Sessions & SA Time Zones", durationMinutes: 12, type: "video" },
      { title: "Knowledge Check: Forex Basics", durationMinutes: 10, type: "quiz" },
      { title: "Your First Trade Walkthrough", durationMinutes: 18, type: "video" },
      { title: "Brokers, Spreads & Swap Rates", durationMinutes: 10, type: "article" },
    ],
    1: [ // Technical Analysis
      { title: "Candlestick Patterns Explained", durationMinutes: 15, type: "video" },
      { title: "Support & Resistance Levels", durationMinutes: 12, type: "video" },
      { title: "Trend Lines & Channels", durationMinutes: 10, type: "article" },
      { title: "Moving Averages: SMA vs EMA", durationMinutes: 14, type: "video" },
      { title: "RSI — Reading Momentum", durationMinutes: 12, type: "video" },
      { title: "MACD Deep Dive", durationMinutes: 15, type: "video" },
      { title: "Bollinger Bands in Practice", durationMinutes: 10, type: "article" },
      { title: "Chart Pattern Recognition Quiz", durationMinutes: 12, type: "quiz" },
      { title: "Putting It All Together", durationMinutes: 20, type: "video" },
    ],
    2: [ // Risk Management
      { title: "Why Most Traders Blow Accounts", durationMinutes: 10, type: "video" },
      { title: "The 1% & 2% Risk Rules", durationMinutes: 12, type: "article" },
      { title: "Calculating Position Size in ZAR", durationMinutes: 15, type: "video" },
      { title: "Risk-to-Reward Ratios", durationMinutes: 10, type: "video" },
      { title: "Stop Loss Placement Strategies", durationMinutes: 13, type: "video" },
      { title: "Drawdown Recovery & Expectations", durationMinutes: 10, type: "article" },
      { title: "Risk Management Assessment", durationMinutes: 10, type: "quiz" },
    ],
    3: [ // JSE & Indices
      { title: "Introduction to the JSE", durationMinutes: 12, type: "video" },
      { title: "JSE Top 40 Components", durationMinutes: 10, type: "article" },
      { title: "Trading the All Share Index", durationMinutes: 15, type: "video" },
      { title: "Sector Rotation in SA Markets", durationMinutes: 12, type: "video" },
      { title: "Earnings Releases & Price Moves", durationMinutes: 14, type: "video" },
      { title: "Global Indices: SP500, DAX, Nas100", durationMinutes: 15, type: "video" },
      { title: "Index CFDs vs ETFs", durationMinutes: 12, type: "article" },
      { title: "JSE Trading Strategy Quiz", durationMinutes: 10, type: "quiz" },
      { title: "Case Study: Naspers & Prosus", durationMinutes: 10, type: "video" },
    ],
    4: [ // Advanced Price Action
      { title: "Market Structure: HH, HL, LH, LL", durationMinutes: 15, type: "video" },
      { title: "Break of Structure & Change of Character", durationMinutes: 18, type: "video" },
      { title: "Order Blocks & Imbalances", durationMinutes: 20, type: "video" },
      { title: "Liquidity Sweeps & Stop Hunts", durationMinutes: 16, type: "video" },
      { title: "Multi-Timeframe Analysis", durationMinutes: 18, type: "video" },
      { title: "Institutional Entry Models", durationMinutes: 22, type: "video" },
      { title: "Advanced Strategy Assessment", durationMinutes: 15, type: "quiz" },
      { title: "Live Trade Analysis Breakdown", durationMinutes: 26, type: "video" },
    ],
    5: [ // Psychology
      { title: "The Psychology of Losing Trades", durationMinutes: 12, type: "video" },
      { title: "FOMO, Greed & Fear Cycles", durationMinutes: 10, type: "article" },
      { title: "Building a Trading Journal", durationMinutes: 12, type: "video" },
      { title: "Pre- & Post-Session Routines", durationMinutes: 10, type: "article" },
      { title: "Mindset Assessment", durationMinutes: 10, type: "quiz" },
      { title: "Developing a Process-Driven Approach", durationMinutes: 16, type: "video" },
    ],
  };

  for (let ci = 0; ci < insertedCourses.length; ci++) {
    const course = insertedCourses[ci];
    const lessons = lessonsByCourse[ci] ?? [];
    if (lessons.length === 0) continue;

    await db.insert(portalLessonsTable).values(
      lessons.map((l, i) => ({
        courseId: course.id,
        title: l.title,
        durationMinutes: l.durationMinutes,
        orderIndex: i,
        type: l.type,
      }))
    );
  }
  console.log("Inserted lessons for all courses");

  // ── Demo leaderboard members ───────────────────────────────────────────
  const demoMembers = [
    { clerkId: "demo_thandeka", displayName: "Thandeka Mokoena", memberType: "professional", country: "ZA" },
    { clerkId: "demo_sipho", displayName: "Sipho Dlamini", memberType: "professional", country: "ZA" },
    { clerkId: "demo_anele", displayName: "Anele Nkosi", memberType: "retail", country: "ZA" },
    { clerkId: "demo_pieter", displayName: "Pieter van der Berg", memberType: "retail", country: "ZA" },
    { clerkId: "demo_naledi", displayName: "Naledi Sithole", memberType: "professional", country: "ZA" },
    { clerkId: "demo_karabo", displayName: "Karabo Molefe", memberType: "retail", country: "ZA" },
    { clerkId: "demo_zanele", displayName: "Zanele Khumalo", memberType: "professional", country: "ZA" },
    { clerkId: "demo_ryan", displayName: "Ryan Fourie", memberType: "retail", country: "ZA" },
  ];

  const insertedMembers = await db.insert(portalMembersTable).values(demoMembers).returning();
  console.log(`Inserted ${insertedMembers.length} demo members`);

  const demoStats = [
    { pnlZar: 284500, pnlPct: 28.45, winRate: 0.68, totalTrades: 142, monthlyPnl: 42100, portfolio: 1284500 },
    { pnlZar: 198200, pnlPct: 19.82, winRate: 0.72, totalTrades: 98, monthlyPnl: 31400, portfolio: 1198200 },
    { pnlZar: 156700, pnlPct: 15.67, winRate: 0.61, totalTrades: 215, monthlyPnl: 22300, portfolio: 1156700 },
    { pnlZar: 122400, pnlPct: 12.24, winRate: 0.59, totalTrades: 178, monthlyPnl: 18900, portfolio: 1122400 },
    { pnlZar: 98600, pnlPct: 9.86, winRate: 0.64, totalTrades: 134, monthlyPnl: 15200, portfolio: 1098600 },
    { pnlZar: 74300, pnlPct: 7.43, winRate: 0.55, totalTrades: 201, monthlyPnl: 11400, portfolio: 1074300 },
    { pnlZar: 51800, pnlPct: 5.18, winRate: 0.52, totalTrades: 87, monthlyPnl: 8700, portfolio: 1051800 },
    { pnlZar: 29100, pnlPct: 2.91, winRate: 0.48, totalTrades: 63, monthlyPnl: 4200, portfolio: 1029100 },
  ];

  // Build realistic 90-day equity curves
  function buildCurve(startValue: number, endValue: number) {
    const curve = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const progress = (89 - i) / 89;
      const noise = (Math.random() - 0.45) * (endValue - startValue) * 0.03;
      const value = startValue + (endValue - startValue) * progress + noise;
      curve.push({ date: d.toISOString().slice(0, 10), valueZar: Math.round(value) });
    }
    return curve;
  }

  for (let i = 0; i < insertedMembers.length; i++) {
    const member = insertedMembers[i];
    const s = demoStats[i];
    const startValue = 1000000;
    await db.insert(portalTradingStatsTable).values({
      memberId: member.id,
      portfolioValueZar: s.portfolio.toFixed(2),
      totalPnlZar: s.pnlZar.toFixed(2),
      totalPnlPct: s.pnlPct.toFixed(4),
      winRate: s.winRate.toFixed(4),
      openPositions: Math.floor(Math.random() * 5),
      totalTrades: s.totalTrades,
      monthlyPnlZar: s.monthlyPnl.toFixed(2),
      equityCurve: buildCurve(startValue, s.portfolio),
    });

    // Activity items
    await db.insert(portalActivityItemsTable).values([
      {
        memberId: member.id,
        type: "trade_closed",
        title: "Trade closed",
        description: `USD/ZAR long closed at +${(Math.random() * 2 + 0.5).toFixed(2)}%`,
        occurredAt: new Date(Date.now() - 1 * 3600000),
      },
      {
        memberId: member.id,
        type: "trade_opened",
        title: "Position opened",
        description: "NAS100 short — 0.5 lot at 19,842",
        occurredAt: new Date(Date.now() - 3 * 3600000),
      },
    ]);
  }

  console.log("Inserted demo trading stats and activity items");
  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
