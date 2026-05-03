export type Role = "STUDENT" | "PARENT" | "SCHOOL" | "TEACHER" | "SOLO" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  schoolId?: string;
  _id?: string;
}

export type Board = "CBSE" | "ICSE" | "IGCSE" | "IB" | "State Board" | "State";

export type Subject =
  | "Mathematics"
  | "Science"
  | "English"
  | "Social Studies"
  | "Hindi"
  | "Physics"
  | "Chemistry"
  | "Biology";

export type QuestionType = "MCQ" | "MSQ" | "Fill in the blanks" | "Short answer";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type TestStatus = "Completed" | "In progress" | "Abandoned";

export interface Student {
  id: string;
  name: string;
  grade: number;
  board: Board;
  avatarUrl?: string;
}

export interface Child extends Student {
  relation: "Son" | "Daughter";
}

export interface Parent {
  id: string;
  name: string;
  childrenIds: string[];
}

export interface TestAttempt {
  id: string;
  title?: string;
  subject: Subject;
  chapter: string;
  topic: string;
  date: string; // ISO
  dueDate?: string | null; // ISO
  score: number; // 0-100
  accuracy: number; // 0-100
  durationMinutes: number;
  questionCount: number;
  status: TestStatus;
  difficulty: Difficulty;
  isAssigned?: boolean;
  assignmentId?: string | null;
}

export interface SubjectPerformance {
  subject: Subject;
  averageScore: number; // 0-100
  testsTaken: number;
  trend: number; // delta vs previous period (-100..100)
}

export interface WeakArea {
  id: string;
  subject: Subject;
  chapter: string;
  topic: string;
  subtopic?: string;
  accuracy: number; // 0-100
  attempts: number;
}

export interface ScorePoint {
  testIndex: number;
  label: string; // short date label
  score: number;
  accuracy: number;
}

export interface ActivityEntry {
  id: string;
  date: string; // ISO
  title: string;
  description: string;
  subject?: Subject;
  score?: number;
}

export type InsightTone = "neutral" | "positive" | "attention" | "motivational";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  description: string;
}

export interface StudentDashboardData {
  student: Student;
  stats: {
    testsTaken: number;
    averageScore: number;
    accuracy: number;
    avgTimePerQuestionSec: number;
  };
  scoreTrend: ScorePoint[];
  subjectPerformance: SubjectPerformance[];
  weakTopics: WeakArea[];
  strongTopics: WeakArea[];
  weakSubtopics: WeakArea[];
  recentTests: TestAttempt[];
  assignedTests?: TestAttempt[];
  pendingTestsCount?: number;
  focusInsights: Insight[];
  motivation: Insight;
}

export interface ParentDashboardData {
  child: Child;
  stats: {
    testsCompleted: number;
    averageScore: number;
    weakTopicsCount: number;
    improvementTrend: number; // -100..100
  };
  performanceTrend: ScorePoint[];
  subjectPerformance: SubjectPerformance[];
  weakTopics: WeakArea[];
  weakSubtopics: WeakArea[];
  activity: ActivityEntry[];
  insights: Insight[];
  summary: string;
}

export interface SchoolClass {
  id: string;
  _id?: string;
  grade: number;
  section: string;
  teacher: string;
  studentCount: number;
  avgScore: number;
  trend: number;
  testsTaken: number;
  topSubject: { subject: string; score: number };
  weakSubject: { subject: string; score: number };
}

export interface SubjectStat {
  subject: string;
  averageScore: number;
  testsTaken: number;
  trend: number;
}

