export interface ProfileCompletenessResult {
  complete: boolean;
  missing: string[];
  data: {
    board?: string;
    grade?: number;
    subjects?: string[];
    subjectChapters?: { subject: string; chapters: string[] }[];
  };
}

/**
 * A student profile is complete when:
 *  - board is set
 *  - grade is set
 *  - at least one subject is selected
 *  - every selected subject has at least one chapter
 *
 * Falls back to localStorage cache if the backend hasn't been migrated yet.
 */
export function getStudentProfileCompleteness(user: any): ProfileCompletenessResult {
  const profile = user?.profile || {};

  let board: string | undefined = profile.board;
  let grade: number | undefined = profile.grade;
  let subjects: string[] | undefined = profile.subjects;
  let subjectChapters: { subject: string; chapters: string[] }[] | undefined =
    profile.subjectChapters;

  // Fallback to local cache (set by onboarding before backend supports new fields)
  try {
    const key = `testwest_onboarding_${user?.id || user?._id}`;
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) {
      const cached = JSON.parse(raw);
      board = board || cached.board;
      grade = grade || cached.grade;
      if (!subjects || subjects.length === 0) subjects = cached.subjects;
      if (!subjectChapters || subjectChapters.length === 0)
        subjectChapters = cached.subjectChapters;
    }
  } catch {}

  const missing: string[] = [];
  if (!board) missing.push("board");
  if (!grade) missing.push("grade");
  if (!subjects || subjects.length === 0) missing.push("subjects");
  const chaptersOk =
    subjects && subjects.length > 0 &&
    subjects.every((s) =>
      (subjectChapters || []).find((sc) => sc.subject === s && sc.chapters.length > 0),
    );
  if (!chaptersOk) missing.push("chapters");

  return {
    complete: missing.length === 0,
    missing,
    data: { board, grade, subjects, subjectChapters },
  };
}
