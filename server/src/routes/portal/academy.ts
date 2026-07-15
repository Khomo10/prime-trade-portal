import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, portalMembersTable, portalCoursesTable, portalLessonsTable, portalLessonCompletionsTable, portalActivityItemsTable } from "../db";
import {
  ListCoursesResponse,
  GetCourseParams,
  GetCourseResponse,
  GetAcademyProgressResponse,
  CompleteLessonParams,
  CompleteLessonResponse,
} from "../zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

// GET /portal/academy/courses
router.get("/portal/academy/courses", async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string | undefined;
  let memberId: number | null = null;

  if (clerkId) {
    const [m] = await db.select().from(portalMembersTable).where(eq(portalMembersTable.clerkId, clerkId));
    if (m) memberId = m.id;
  }

  const courses = await db.select().from(portalCoursesTable).orderBy(portalCoursesTable.id);
  const lessons = await db.select().from(portalLessonsTable);

  const completedLessonIds = memberId
    ? new Set(
        (await db.select({ lessonId: portalLessonCompletionsTable.lessonId })
          .from(portalLessonCompletionsTable)
          .where(eq(portalLessonCompletionsTable.memberId, memberId)))
          .map((r) => r.lessonId)
      )
    : new Set<number>();

  const lessonCountByCourse = new Map<number, number>();
  for (const l of lessons) {
    lessonCountByCourse.set(l.courseId, (lessonCountByCourse.get(l.courseId) ?? 0) + 1);
  }

  const completedByCourse = new Map<number, number>();
  for (const l of lessons) {
    if (completedLessonIds.has(l.id)) {
      completedByCourse.set(l.courseId, (completedByCourse.get(l.courseId) ?? 0) + 1);
    }
  }

  res.json(ListCoursesResponse.parse(courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    level: c.level,
    lessonCount: lessonCountByCourse.get(c.id) ?? 0,
    durationMinutes: c.durationMinutes,
    category: c.category,
    coverEmoji: c.coverEmoji,
    completedLessons: completedByCourse.get(c.id) ?? 0,
  }))));
});

// GET /portal/academy/courses/:courseId
router.get("/portal/academy/courses/:courseId", async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string | undefined;
  let memberId: number | null = null;

  if (clerkId) {
    const [m] = await db.select().from(portalMembersTable).where(eq(portalMembersTable.clerkId, clerkId));
    if (m) memberId = m.id;
  }

  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const params = GetCourseParams.safeParse({ courseId: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db
    .select()
    .from(portalCoursesTable)
    .where(eq(portalCoursesTable.id, params.data.courseId));

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const lessons = await db
    .select()
    .from(portalLessonsTable)
    .where(eq(portalLessonsTable.courseId, course.id))
    .orderBy(portalLessonsTable.orderIndex);

  const completedLessonIds = memberId
    ? new Set(
        (await db.select({ lessonId: portalLessonCompletionsTable.lessonId })
          .from(portalLessonCompletionsTable)
          .where(eq(portalLessonCompletionsTable.memberId, memberId)))
          .map((r) => r.lessonId)
      )
    : new Set<number>();

  const completedLessonsCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;

  res.json(GetCourseResponse.parse({
    id: course.id,
    title: course.title,
    description: course.description,
    level: course.level,
    lessonCount: lessons.length,
    durationMinutes: course.durationMinutes,
    category: course.category,
    coverEmoji: course.coverEmoji,
    completedLessons: completedLessonsCount,
    lessons: lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      durationMinutes: l.durationMinutes,
      orderIndex: l.orderIndex,
      type: l.type,
      isCompleted: completedLessonIds.has(l.id),
    })),
  }));
});

// GET /portal/academy/progress
router.get("/portal/academy/progress", requireAuth, async (req, res): Promise<void> => {
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

  const allLessons = await db.select().from(portalLessonsTable);
  const allCourses = await db.select().from(portalCoursesTable);

  const completions = await db
    .select()
    .from(portalLessonCompletionsTable)
    .where(eq(portalLessonCompletionsTable.memberId, member.id));

  const completedLessonIds = new Set(completions.map((c) => c.lessonId));
  const totalXp = completions.reduce((sum, c) => sum + c.xpAwarded, 0);

  // Count completed courses (all lessons done)
  const lessonsByCourse = new Map<number, number[]>();
  for (const l of allLessons) {
    if (!lessonsByCourse.has(l.courseId)) lessonsByCourse.set(l.courseId, []);
    lessonsByCourse.get(l.courseId)!.push(l.id);
  }

  let completedCourses = 0;
  for (const [, lessonIds] of lessonsByCourse) {
    if (lessonIds.every((id) => completedLessonIds.has(id))) completedCourses++;
  }

  // Streak: count consecutive days with completions (simplified: distinct dates)
  const completionDates = new Set(
    completions.map((c) => c.completedAt.toISOString().slice(0, 10))
  );
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (completionDates.has(d.toISOString().slice(0, 10))) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  res.json(GetAcademyProgressResponse.parse({
    totalLessons: allLessons.length,
    completedLessons: completedLessonIds.size,
    totalCourses: allCourses.length,
    completedCourses,
    streakDays,
    xpPoints: totalXp,
  }));
});

// POST /portal/academy/lessons/:lessonId/complete
router.post("/portal/academy/lessons/:lessonId/complete", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;

  const raw = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
  const params = CompleteLessonParams.safeParse({ lessonId: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

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

  const [lesson] = await db
    .select()
    .from(portalLessonsTable)
    .where(eq(portalLessonsTable.id, params.data.lessonId));

  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  // Idempotent — skip if already completed
  const [existing] = await db
    .select()
    .from(portalLessonCompletionsTable)
    .where(and(
      eq(portalLessonCompletionsTable.memberId, member.id),
      eq(portalLessonCompletionsTable.lessonId, lesson.id)
    ));

  const xpAwarded = 50;
  const now = new Date();

  if (!existing) {
    await db.insert(portalLessonCompletionsTable).values({
      memberId: member.id,
      lessonId: lesson.id,
      xpAwarded,
    });

    // Add activity item
    await db.insert(portalActivityItemsTable).values({
      memberId: member.id,
      type: "lesson_completed",
      title: "Lesson completed",
      description: `You completed "${lesson.title}"`,
      occurredAt: now,
    });
  }

  res.json(CompleteLessonResponse.parse({
    lessonId: lesson.id,
    completedAt: (existing?.completedAt ?? now).toISOString(),
    xpAwarded: existing ? 0 : xpAwarded,
  }));
});

// Need activity table imported
import { portalActivityItemsTable } from "../db";

export default router;
