import { useQuery } from "@tanstack/react-query";
import { studentService, testService, parentService, teacherService, schoolService, assignmentService, curriculumService } from "../../services/api";
import { StudentDashboardData, ParentDashboardData, TestAttempt, User } from "@/types";
import { authService } from "../../services/api";

export function useUser() {
  const hasToken = typeof window !== "undefined" && !!window.localStorage.getItem("testwest_token");
  return useQuery<User & { profile: any }>({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    enabled: hasToken,           // don't call /auth/me at all when not logged in
    retry: false,
    staleTime: 5 * 60 * 1000,   // 5 minutes — won't refetch while fresh
    gcTime: 10 * 60 * 1000,     // 10 minutes — keep in cache
    refetchOnWindowFocus: false, // don't re-hit the server on tab switch
  });
}

export function useStudentDashboard(studentId: string) {
  return useQuery<StudentDashboardData>({
    queryKey: ["studentDashboard", studentId],
    queryFn: () => studentService.getDashboard(studentId),
    enabled: !!studentId,
  });
}

export function useTests(studentId: string) {
  return useQuery<TestAttempt[]>({
    queryKey: ["tests", studentId],
    queryFn: async () => {
      const res = await studentService.getTests(studentId);
      return Array.isArray(res) ? res : (res.data || []);
    },
    enabled: !!studentId,
  });
}

export function useParentChildren(parentId: string) {
  return useQuery<any[]>({
    queryKey: ["parentChildren", parentId],
    queryFn: () => parentService.getChildren(parentId),
    enabled: !!parentId,
  });
}

export function useParentDashboard(parentId: string, childId: string) {
  return useQuery<ParentDashboardData>({
    queryKey: ["parentDashboard", parentId, childId],
    queryFn: () => parentService.getChildDashboard(parentId, childId),
    enabled: !!parentId && !!childId,
  });
}

export function useTeacherStats(teacherId: string) {
  return useQuery<any>({
    queryKey: ["teacherStats", teacherId],
    queryFn: () => teacherService.getStats(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherStudents(teacherId: string) {
  return useQuery<any[]>({
    queryKey: ["teacherStudents", teacherId],
    queryFn: () => teacherService.getStudents(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherClasses(teacherId: string) {
  return useQuery<any[]>({
    queryKey: ["teacherClasses", teacherId],
    queryFn: () => teacherService.getClasses(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherAnalytics(teacherId: string) {
  return useQuery<any[]>({
    queryKey: ["teacherAnalytics", teacherId],
    queryFn: () => teacherService.getSubjectAnalytics(teacherId),
    enabled: !!teacherId,
  });
}

export function useTeacherTopics(teacherId: string) {
  return useQuery<any[]>({
    queryKey: ["teacherTopics", teacherId],
    queryFn: () => teacherService.getTopicMastery(teacherId),
    enabled: !!teacherId,
  });
}

export function useSchoolStats(schoolId: string) {
  return useQuery<any>({
    queryKey: ["schoolStats", schoolId],
    queryFn: () => schoolService.getStats(schoolId),
    enabled: !!schoolId,
  });
}

export function useSchoolClasses(schoolId: string) {
  return useQuery<any[]>({
    queryKey: ["schoolClasses", schoolId],
    queryFn: async () => {
      const res = await schoolService.listClasses(schoolId);
      return Array.isArray(res) ? res : (res.data || []);
    },
    enabled: !!schoolId,
  });
}

export function useSchool(schoolId: string) {
  return useQuery<any>({
    queryKey: ["school", schoolId],
    queryFn: () => schoolService.get(schoolId),
    enabled: !!schoolId,
  });
}

export function useClassStudents(schoolId: string, classId: string) {
  return useQuery<any[]>({
    queryKey: ["school", schoolId, "class", classId, "students"],
    queryFn: () => schoolService.getClassStudents(schoolId, classId),
    enabled: !!schoolId && !!classId,
  });
}

export function useSchoolTeachers(schoolId: string) {
  return useQuery<any>({
    queryKey: ["schoolTeachers", schoolId],
    queryFn: async () => {
      const res = await schoolService.listTeachers(schoolId);
      return Array.isArray(res) ? res : (res.data || []);
    },
    enabled: !!schoolId,
  });
}

export function useSchoolStudents(schoolId: string) {
  return useQuery<any>({
    queryKey: ["schoolStudents", schoolId],
    queryFn: async () => {
      const res = await schoolService.listStudents(schoolId);
      return Array.isArray(res) ? res : (res.data || []);
    },
    enabled: !!schoolId,
  });
}

export function useStudent(studentId: string) {
  return useQuery<any>({
    queryKey: ["student", studentId],
    queryFn: () => studentService.get(studentId),
    enabled: !!studentId,
  });
}

export function useParent(parentId: string) {
  return useQuery<any>({
    queryKey: ["parent", parentId],
    queryFn: () => parentService.get(parentId),
    enabled: !!parentId,
  });
}

export function useTest(testId: string) {
  return useQuery<any>({
    queryKey: ["test", testId],
    queryFn: () => testService.get(testId),
    enabled: !!testId,
  });
}

export function useAssignments(params: any = {}) {
  return useQuery<any[]>({
    queryKey: ["assignments", params],
    queryFn: async () => {
      const res = await assignmentService.list(params);
      return Array.isArray(res) ? res : (res.data || []);
    },
  });
}

export function useAssignmentResults(assignmentId: string) {
  return useQuery<any>({
    queryKey: ["assignment-results", assignmentId],
    queryFn: () => assignmentService.getResults(assignmentId),
    enabled: !!assignmentId,
  });
}

// Curriculum Hooks
export function useBoards() {
  return useQuery<string[]>({
    queryKey: ["boards"],
    queryFn: () => curriculumService.getBoards(),
  });
}

export function useGrades() {
  return useQuery<number[]>({
    queryKey: ["grades"],
    queryFn: () => curriculumService.getGrades(),
  });
}

export function useSubjects(board?: string | null, grade?: number | null) {
  return useQuery<string[]>({
    queryKey: ["subjects", board, grade],
    queryFn: () => curriculumService.getSubjects({ board, grade }),
    enabled: !!board && !!grade,
  });
}

export function useChapters(board?: string | null, grade?: number | null, subject?: string | null) {
  return useQuery<string[]>({
    queryKey: ["chapters", board, grade, subject],
    queryFn: () => curriculumService.getChapters({ board, grade, subject }),
    enabled: !!board && !!grade && !!subject,
  });
}

export function useTopics(subject?: string | null, chapter?: string | null) {
  return useQuery<string[]>({
    queryKey: ["topics", subject, chapter],
    queryFn: () => curriculumService.getTopics({ subject, chapter }),
    enabled: !!subject && !!chapter,
  });
}

export function useSubtopics(chapter?: string | null, topic?: string | null) {
  return useQuery<string[]>({
    queryKey: ["subtopics", chapter, topic],
    queryFn: () => curriculumService.getSubtopics({ chapter, topic }),
    enabled: !!chapter && !!topic,
  });
}

export function useQuestionCount(params: any) {
  return useQuery<{ count: number }>({
    queryKey: ["questionCount", params],
    queryFn: () => curriculumService.getQuestionCount(params),
    enabled: Object.keys(params).length > 0,
  });
}
