import { Link } from "@tanstack/react-router";
import { PlusCircle, Target, Timer, Trophy, Activity, Loader2, ClipboardList, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { WeakTopicList } from "@/components/dashboard/WeakTopicList";
import { SubjectTopicsBreakdown } from "@/components/dashboard/SubjectTopicsBreakdown";
import { RecentTestsTable } from "@/components/dashboard/RecentTestsTable";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Badge } from "@/components/ui/badge";
import { useStudentDashboard, useUser } from "@/lib/api/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUser();
  
  // Use the student ID from the user profile, or null if loading
  const studentId = user?.profile?._id || user?.profile?.id || user?.id || user?._id || "";
  
  const { data, isLoading, error } = useStudentDashboard(studentId); 

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isUserLoading, navigate]);

  if (isUserLoading || (user && !studentId && isLoading)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <p>Failed to load dashboard data. Ensure the backend is running.</p>
        <p className="text-sm">Error: {error?.message}</p>
      </div>
    );
  }


  // Check if student is connected to a school (cannot create own tests)
  const isSchoolConnected = !!user?.profile?.schoolId || !!user?.schoolId;

  return (
    <PageContainer>
      {/* Welcome */}
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary-soft/60 via-background to-background">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
              Welcome back
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Hi, {data.student.name.split(" ")[0]} 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Grade {data.student.grade} · {data.student.board} · You're up{" "}
              <span className="font-medium text-success">12%</span> this month — keep going.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isSchoolConnected && (
              <Button asChild size="lg" className="shadow-sm">
                <Link to="/test/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create new test
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant={isSchoolConnected ? "default" : "outline"}>
              <Link to="/tests">View {isSchoolConnected ? "assigned" : "past"} tests</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests taken" value={data.stats.testsTaken} icon={Trophy} delta={8} hint="Last 30 days" />
        <StatCard label="Avg score" value={`${data.stats.averageScore}%`} icon={Target} delta={4} hint="Across all subjects" />
        <StatCard label="Accuracy" value={`${data.stats.accuracy}%`} icon={Activity} delta={3} hint="Correct / answered" />
        <StatCard label="Avg time / question" value={`${data.stats.avgTimePerQuestionSec}s`} icon={Timer} delta={-6} hint="Faster than last month" />
      </div>

      {/* Assigned Tests - Show prominently if there are any */}
      {data.assignedTests && data.assignedTests.length > 0 && (
        <div className="mt-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
                Tests Assigned to You
                <Badge variant="secondary" className="ml-2">{data.assignedTests.length} pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.assignedTests.map((test: any) => (
                <div 
                  key={test.id} 
                  className="flex items-center justify-between rounded-lg border bg-background p-4"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{test.title || test.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {test.subject} · {test.chapter || "General"} · {test.difficulty}
                    </p>
                    {test.dueDate && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        Due: {new Date(test.dueDate).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                  <Button asChild size="sm">
                    <Link to="/test/$testId/take" params={{ testId: test.id }}>
                      Start Test
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Score trend"
          subtitle="Your last 10 tests"
          className="lg:col-span-2"
        >
          <ScoreTrendChart data={data.scoreTrend} />
        </ChartCard>
        <ChartCard title="Subject performance" subtitle="Average score by subject">
          <SubjectPerformanceChart data={data.subjectPerformance} />
        </ChartCard>
      </div>

      {/* Subject-wise strong & weak topics */}
      <div className="mt-8">
        <SectionHeader
          title="Strong & weak topics by subject"
          subtitle="Switch subjects to see what you've mastered and what needs work"
        />
        <SubjectTopicsBreakdown strong={data.strongTopics} weak={data.weakTopics} />
      </div>

      {/* Weak areas */}
      <div className="mt-8">
        <SectionHeader
          title="Where to focus"
          subtitle="Topics and subtopics that need attention"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeakTopicList title="Weak topics" items={data.weakTopics} />
          <WeakTopicList title="Weak subtopics" items={data.weakSubtopics} variant="subtopic" />
        </div>
      </div>

      {/* Recent tests */}
      <div className="mt-8">
        <SectionHeader title="Recent attempts" subtitle="Your latest tests, scores, and accuracy" />
        <RecentTestsTable tests={data.recentTests} />
      </div>

      {/* Focus insights */}
      <div className="mt-8">
        <SectionHeader title="Recommended focus this week" subtitle="Bite-sized actions to lift your scores" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.focusInsights.map((i) => (
            <InsightCard key={i.id} tone={i.tone} title={i.title} description={i.description} />
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="mt-8">
        <InsightCard
          tone={data.motivation.tone}
          title={data.motivation.title}
          description={data.motivation.description}
        />
      </div>
    </PageContainer>
  );
}
