import { useListCourses, useGetAcademyProgress, useGetCourse, useCompleteLesson, getGetCourseQueryKey, getGetAcademyProgressQueryKey } from "@/api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, BookOpen, Clock, PlayCircle, FileText, CheckCircle2, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function CourseDetailView({ courseId, onBack }: { courseId: number, onBack: () => void }) {
  const { data: course, isLoading } = useGetCourse(courseId);
  const completeLessonMutation = useCompleteLesson();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleComplete = (lessonId: number) => {
    completeLessonMutation.mutate({ lessonId }, {
      onSuccess: (data) => {
        toast({
          title: "Lesson Completed!",
          description: `You earned ${data.xpAwarded} XP`,
        });
        // Invalidate course detail to update completion status
        queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId) });
        // Also invalidate progress
        queryClient.invalidateQueries({ queryKey: getGetAcademyProgressQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not mark lesson as complete.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="-ml-4 mb-4 text-muted-foreground"><ChevronLeft className="w-4 h-4 mr-2"/> Back to Courses</Button>
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-5/6 mb-8" />
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button variant="ghost" onClick={onBack} className="-ml-4 mb-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1"/> Back to Courses
        </Button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center text-3xl shadow-sm">
            {course.coverEmoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="capitalize">{course.level}</Badge>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {course.durationMinutes} mins</span>
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> {course.lessonCount} lessons</span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl">{course.description}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Your Progress</h3>
          <span className="text-sm font-medium">{course.completedLessons || 0} / {course.lessonCount} Lessons</span>
        </div>
        <Progress value={((course.completedLessons || 0) / course.lessonCount) * 100} className="h-2" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        <div className="space-y-4">
          {course.lessons.sort((a,b) => a.orderIndex - b.orderIndex).map((lesson, idx) => (
            <div key={lesson.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${lesson.isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-card border-border hover:border-primary/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lesson.isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {lesson.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{idx + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold truncate ${lesson.isCompleted ? 'text-foreground' : 'text-foreground'}`}>
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center uppercase tracking-wider">
                    {lesson.type === 'video' ? <PlayCircle className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                    {lesson.type}
                  </span>
                  <span>{lesson.durationMinutes} mins</span>
                </div>
              </div>
              <div>
                <Button 
                  variant={lesson.isCompleted ? "secondary" : "outline"}
                  size="sm"
                  disabled={lesson.isCompleted || completeLessonMutation.isPending}
                  onClick={() => handleComplete(lesson.id)}
                  className={lesson.isCompleted ? "text-primary opacity-100" : ""}
                >
                  {lesson.isCompleted ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Academy() {
  const { data: courses, isLoading: isLoadingCourses } = useListCourses();
  const { data: progress, isLoading: isLoadingProgress } = useGetAcademyProgress();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  if (selectedCourseId) {
    return <CourseDetailView courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trading Academy</h1>
        <p className="text-muted-foreground">Master the markets with structured educational content.</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Day Streak</p>
              {isLoadingProgress ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="text-2xl font-bold">{progress?.streakDays || 0}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">XP Earned</p>
              {isLoadingProgress ? <Skeleton className="h-7 w-16 mt-1" /> : <p className="text-2xl font-bold">{progress?.xpPoints || 0}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Lessons</p>
              {isLoadingProgress ? <Skeleton className="h-7 w-20 mt-1" /> : <p className="text-2xl font-bold">{progress?.completedLessons || 0} <span className="text-sm font-normal text-muted-foreground">/ {progress?.totalLessons || 0}</span></p>}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Courses</p>
              {isLoadingProgress ? <Skeleton className="h-7 w-20 mt-1" /> : <p className="text-2xl font-bold">{progress?.completedCourses || 0} <span className="text-sm font-normal text-muted-foreground">/ {progress?.totalCourses || 0}</span></p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingCourses ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-32 bg-muted animate-pulse" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : courses && courses.length > 0 ? (
            courses.map(course => {
              const progressPct = course.completedLessons && course.lessonCount ? (course.completedLessons / course.lessonCount) * 100 : 0;
              
              return (
                <Card key={course.id} className="group hover:border-primary/50 transition-colors flex flex-col cursor-pointer overflow-hidden" onClick={() => setSelectedCourseId(course.id)}>
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl relative">
                    {course.coverEmoji}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors" />
                  </div>
                  <CardHeader className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="capitalize text-xs">{course.level}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1"/>{course.durationMinutes}m</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex-col items-stretch gap-3 border-t border-border/50 pt-4 bg-muted/20">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{course.completedLessons || 0} of {course.lessonCount} lessons</span>
                      <span>{Math.round(progressPct)}%</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              No courses available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
