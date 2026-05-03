import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlusCircle, Search, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useUser, useTests } from "@/lib/api/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { Subject, Difficulty, TestStatus, TestAttempt } from "@/types";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "My Tests — TestWest" },
      {
        name: "description",
        content:
          "Browse, search and filter every test attempt: subject, difficulty, status, and time range.",
      },
      { property: "og:title", content: "My Tests — TestWest" },
      {
        property: "og:description",
        content: "Every test attempt with filters and quick access to results.",
      },
    ],
  }),
  component: TestsRoute,
});

type SortKey = "date" | "score" | "accuracy" | "subject";
type SortDir = "asc" | "desc";
type Range = "7d" | "30d" | "90d" | "all";

function rangeToDays(r: Range) {
  return r === "7d" ? 7 : r === "30d" ? 30 : r === "90d" ? 90 : null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function scoreClass(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-foreground";
  return "text-destructive";
}

function statusVariant(s: TestStatus) {
  if (s === "Completed") return "secondary" as const;
  if (s === "In progress") return "default" as const;
  return "destructive" as const;
}

function TestsRoute() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isUserLoading, navigate]);

  if (isUserLoading) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell
      title="My tests"
      subtitle="Every attempt, searchable and filterable"
      role={user.role}
      userName={`${user.firstName} ${user.lastName}`}
    >
      <TestsView user={user} />
    </AppShell>
  );
}

function TestsView({ user }: { user: any }) {
  const { data: allTests, isLoading: isTestsLoading } = useTests(user.profile?._id || "");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<TestStatus | "all">("all");
  const [range, setRange] = useState<Range>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    if (!allTests) return [];
    const days = rangeToDays(range);
    const cutoff = days ? Date.now() - days * 86400000 : 0;
    const q = query.trim().toLowerCase();

    const list = [...allTests].filter((t: any) => {
      if (subject !== "all" && t.subject !== subject) return false;
      if (difficulty !== "all" && t.difficulty !== difficulty) return false;
      if (status !== "all" && t.status !== status) return false;
      if (days && new Date(t.date).getTime() < cutoff) return false;
      if (q) {
        const hay = `${t.subject} ${t.chapter} ${t.topic}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "score":
          return ((a.score || 0) - (b.score || 0)) * dir;
        case "accuracy":
          return ((a.accuracy || 0) - (b.accuracy || 0)) * dir;
        case "subject":
          return a.subject.localeCompare(b.subject) * dir;
        case "date":
        default:
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      }
    });
    return list;
  }, [allTests, query, subject, difficulty, status, range, sortKey, sortDir]);

  const total = allTests?.length || 0;
  const showing = filtered.length;

  const completed = filtered.filter((t: any) => t.status === "Completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s: number, t: any) => s + (t.score || 0), 0) / completed.length)
    : 0;
  const avgAccuracy = completed.length
    ? Math.round(completed.reduce((s: number, t: any) => s + (t.accuracy || 0), 0) / completed.length)
    : 0;

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "subject" ? "asc" : "desc");
    }
  }

  function resetFilters() {
    setQuery("");
    setSubject("all");
    setDifficulty("all");
    setStatus("all");
    setRange("all");
  }

  const hasActiveFilters =
    query !== "" || subject !== "all" || difficulty !== "all" || status !== "all" || range !== "all";

  // Check if student is connected to a school
  const isSchoolConnected = user?.role === "STUDENT" && (!!user?.profile?.schoolId || !!user?.schoolId);

  if (isTestsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
        <SectionHeader
          title={isSchoolConnected ? "My Assigned Tests" : "All test attempts"}
          subtitle={`${showing} of ${total} attempts · Avg score ${avgScore}% · Avg accuracy ${avgAccuracy}%`}
          action={
            !isSchoolConnected ? (
              <Button asChild>
                <Link to="/test/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New test
                </Link>
              </Button>
            ) : undefined
          }
        />

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_repeat(4,minmax(0,160px))_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subject, chapter, topic…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={subject} onValueChange={(v) => setSubject(v as Subject | "all")}>
                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {(["Mathematics", "Science", "English", "Social Studies"] as Subject[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty | "all")}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(v) => setStatus(v as TestStatus | "all")}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={range} onValueChange={(v) => setRange(v as Range)}>
                <SelectTrigger><SelectValue placeholder="Time range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="md:self-stretch"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No tests match your filters"
                  description="Try a different subject, status, or time range."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <SortHead label="Subject" active={sortKey === "subject"} dir={sortDir} onClick={() => toggleSort("subject")} className="pl-5" />
                    <TableHead>Chapter / Topic</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <SortHead label="Score" active={sortKey === "score"} dir={sortDir} onClick={() => toggleSort("score")} align="right" />
                    <SortHead label="Accuracy" active={sortKey === "accuracy"} dir={sortDir} onClick={() => toggleSort("accuracy")} align="right" />
                    <TableHead>Questions</TableHead>
                    <SortHead label="Date" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                    <TableHead className="pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TestRow key={t.id} t={t} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContainer>
  );
}

function TestRow({ t }: { t: TestAttempt }) {
  return (
    <TableRow>
      <TableCell className="pl-5 font-medium">
        {t.title ? (
          <div>
            <span className="text-foreground">{t.title}</span>
            <span className="block text-xs text-muted-foreground">{t.subject}</span>
          </div>
        ) : (
          t.subject
        )}
        {t.isAssigned && (
          <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">Assigned</Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <span className="text-foreground">{t.chapter}</span>
        <span className="mx-1.5">·</span>
        {t.topic}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-normal">{t.difficulty}</Badge>
      </TableCell>
      <TableCell className={cn("text-right font-semibold tabular-nums", scoreClass(t.score))}>
        {t.status === "Completed" ? `${t.score}%` : "—"}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {t.status === "Completed" ? `${t.accuracy}%` : "—"}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{t.questionCount}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(t.date)}
        {t.dueDate && (
          <span className="block text-xs text-muted-foreground">
            Due: {formatDate(t.dueDate)}
          </span>
        )}
      </TableCell>
      <TableCell className="pr-5">
        {t.status === "Completed" ? (
          <Link to="/test/$testId/results" params={{ testId: t.id }}>
            <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-secondary/80">
              {t.status}
            </Badge>
          </Link>
        ) : (
          <Link to="/test/$testId/take" params={{ testId: t.id }}>
            <Badge variant="default" className="font-normal cursor-pointer hover:bg-primary/80">
              {t.status === "In progress" ? "Continue" : "Start"}
            </Badge>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}

function SortHead({
  label,
  active,
  dir,
  onClick,
  align,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "right";
  className?: string;
}) {
  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active ? "opacity-100" : "opacity-40")} />
        {active && <span className="sr-only">{dir === "asc" ? "ascending" : "descending"}</span>}
      </button>
    </TableHead>
  );
}
