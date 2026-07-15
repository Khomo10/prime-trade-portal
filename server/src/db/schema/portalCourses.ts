import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portalCoursesTable = pgTable("portal_courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull().default("beginner"),
  category: text("category").notNull(),
  coverEmoji: text("cover_emoji").notNull().default("📚"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalLessonsTable = pgTable("portal_lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => portalCoursesTable.id),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  orderIndex: integer("order_index").notNull().default(0),
  type: text("type").notNull().default("article"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalLessonCompletionsTable = pgTable("portal_lesson_completions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  lessonId: integer("lesson_id").notNull().references(() => portalLessonsTable.id),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  xpAwarded: integer("xp_awarded").notNull().default(50),
});

export const insertPortalCourseSchema = createInsertSchema(portalCoursesTable).omit({ id: true, createdAt: true });
export type InsertPortalCourse = z.infer<typeof insertPortalCourseSchema>;
export type PortalCourse = typeof portalCoursesTable.$inferSelect;

export const insertPortalLessonSchema = createInsertSchema(portalLessonsTable).omit({ id: true, createdAt: true });
export type InsertPortalLesson = z.infer<typeof insertPortalLessonSchema>;
export type PortalLesson = typeof portalLessonsTable.$inferSelect;

export const insertPortalLessonCompletionSchema = createInsertSchema(portalLessonCompletionsTable).omit({ id: true, completedAt: true });
export type InsertPortalLessonCompletion = z.infer<typeof insertPortalLessonCompletionSchema>;
export type PortalLessonCompletion = typeof portalLessonCompletionsTable.$inferSelect;
