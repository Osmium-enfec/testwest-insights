import { useEffect, useMemo, useState } from "react";
import { Loader2, GraduationCap, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBoards, useGrades, useSubjects, useChapters } from "@/lib/api/hooks";
import { ALL_BOARDS, ALL_GRADES, ALL_SUBJECTS } from "@/lib/constants";
import { studentService } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  user: any;
  onComplete: () => void;
}

type SubjectChapters = { subject: string; chapters: string[] };

export function StudentOnboarding({ user, onComplete }: Props) {
  const profile = user?.profile || {};
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [board, setBoard] = useState<string>(profile.board || "");
  const [grade, setGrade] = useState<number | null>(profile.grade || null);
  const [subjects, setSubjects] = useState<string[]>(profile.subjects || []);
  const [subjectChapters, setSubjectChapters] = useState<SubjectChapters[]>(
    profile.subjectChapters || [],
  );
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const qc = useQueryClient();

  const { data: dbBoards } = useBoards();
  const { data: dbGrades } = useGrades();
  const { data: dbSubjects } = useSubjects(board || null, grade || null);
  const { data: dbChapters } = useChapters(board || null, grade || null, activeSubject || null);

  const boards = useMemo(() => Array.from(new Set([...ALL_BOARDS, ...(dbBoards || [])])), [dbBoards]);
  const grades = useMemo(
    () => Array.from(new Set([...ALL_GRADES, ...(dbGrades || [])])).sort((a, b) => a - b),
    [dbGrades],
  );
  const availableSubjects = useMemo(
    () => Array.from(new Set([...ALL_SUBJECTS, ...(dbSubjects || [])])),
    [dbSubjects],
  );

  // Initialize active subject when entering step 4
  useEffect(() => {
    if (step === 4 && subjects.length && !activeSubject) {
      setActiveSubject(subjects[0]);
    }
  }, [step, subjects, activeSubject]);

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const getChaptersFor = (s: string) =>
    subjectChapters.find((sc) => sc.subject === s)?.chapters || [];

  const toggleChapter = (subject: string, chapter: string) => {
    setSubjectChapters((prev) => {
      const existing = prev.find((sc) => sc.subject === subject);
      if (!existing) {
        return [...prev, { subject, chapters: [chapter] }];
      }
      const has = existing.chapters.includes(chapter);
      return prev.map((sc) =>
        sc.subject === subject
          ? { ...sc, chapters: has ? sc.chapters.filter((c) => c !== chapter) : [...sc.chapters, chapter] }
          : sc,
      );
    });
  };

  const allSubjectsHaveChapters = subjects.every((s) => getChaptersFor(s).length > 0);

  const canSubmit = !!board && !!grade && subjects.length > 0 && allSubjectsHaveChapters;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      // Cleanup chapters for subjects no longer selected
      const cleanedChapters = subjectChapters.filter((sc) => subjects.includes(sc.subject));

      const profileId = profile?._id || profile?.id;
      if (profileId) {
        await studentService.update(profileId, {
          profile: {
            board,
            grade,
            subjects,
            subjectChapters: cleanedChapters,
          },
        });
      }

      // Cache locally so the gate clears even if backend doesn't yet support fields
      try {
        const key = `testwest_onboarding_${user?.id || user?._id}`;
        localStorage.setItem(
          key,
          JSON.stringify({ board, grade, subjects, subjectChapters: cleanedChapters }),
        );
      } catch {}

      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile saved", { description: "Welcome to your dashboard!" });
      onComplete();
    } catch (err: any) {
      toast.error("Couldn't save", { description: err?.message || "Please try again" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Let's set up your learning profile</h1>
          <p className="mt-2 text-muted-foreground">
            We need a few details before showing your dashboard.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-2 w-12 rounded-full transition-colors ${
                step >= n ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && (<><GraduationCap className="h-5 w-5" /> Step 1 — Select your board</>)}
              {step === 2 && (<><GraduationCap className="h-5 w-5" /> Step 2 — Select your grade</>)}
              {step === 3 && (<><BookOpen className="h-5 w-5" /> Step 3 — Select your subjects</>)}
              {step === 4 && (<><Layers className="h-5 w-5" /> Step 4 — Select chapters per subject</>)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {boards.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBoard(b)}
                    className={`rounded-lg border p-4 text-left transition-all hover:border-primary ${
                      board === b ? "border-primary bg-primary/5 ring-2 ring-primary/30" : ""
                    }`}
                  >
                    <div className="font-medium">{b}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`rounded-lg border p-4 text-center transition-all hover:border-primary ${
                      grade === g ? "border-primary bg-primary/5 ring-2 ring-primary/30" : ""
                    }`}
                  >
                    <div className="text-sm text-muted-foreground">Grade</div>
                    <div className="text-xl font-semibold">{g}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Pick all subjects you study (you can change later).
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {availableSubjects.map((s) => {
                    const checked = subjects.includes(s);
                    return (
                      <label
                        key={s}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary ${
                          checked ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleSubject(s)} />
                        <span className="font-medium">{s}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Choose subject</label>
                  <Select value={activeSubject} onValueChange={setActiveSubject}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s} {getChaptersFor(s).length > 0 && `(${getChaptersFor(s).length})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeSubject && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Chapters available for {activeSubject}
                    </p>
                    {(!dbChapters || dbChapters.length === 0) ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No chapters found in the curriculum yet for this subject. Type your own or skip.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {dbChapters.map((c) => {
                          const selected = getChaptersFor(activeSubject).includes(c);
                          return (
                            <label
                              key={c}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary ${
                                selected ? "border-primary bg-primary/5" : ""
                              }`}
                            >
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => toggleChapter(activeSubject, c)}
                              />
                              <span className="text-sm">{c}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Progress</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subjects.map((s) => {
                      const count = getChaptersFor(s).length;
                      return (
                        <Badge key={s} variant={count > 0 ? "default" : "outline"} className="gap-1">
                          {count > 0 && <CheckCircle2 className="h-3 w-3" />}
                          {s} · {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
                disabled={step === 1}
              >
                Back
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                  disabled={
                    (step === 1 && !board) ||
                    (step === 2 && !grade) ||
                    (step === 3 && subjects.length === 0)
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    "Finish & Go to Dashboard"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
