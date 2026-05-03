export const API_URL = import.meta.env.VITE_API_URL || "https://testwest.onrender.com";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("testwest_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("testwest_token");
      const authPages = ["/login", "/signup"];
      if (typeof window !== "undefined" && !authPages.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.error || "An error occurred with the API.";
    if (errorData.details && Array.isArray(errorData.details)) {
      errorMessage = errorData.details.map((d: any) => `${d.path}: ${d.message}`).join(', ');
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const authService = {
  login: async (credentials: any) => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem("testwest_token", data.token);
    }
    return data;
  },
  register: async (userData: any) => {
    const data = await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem("testwest_token", data.token);
    }
    return data;
  },
  getMe: async () => {
    return await fetchApi("/auth/me");
  },
  logout: () => {
    localStorage.removeItem("testwest_token");
    window.location.href = "/login";
  }
};

export const userService = {
  updateMe: (data: any) => fetchApi("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
};

export const assignmentService = {
  list: (params = {}) => fetchApi(`/assignments?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/assignments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/assignments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/assignments/${id}`, { method: "DELETE" }),
  getResults: (id: string) => fetchApi(`/assignments/${id}/results`),
};

export const curriculumService = {
  getBoards: () => fetchApi("/curriculum/boards"),
  getGrades: () => fetchApi("/curriculum/grades"),
  getSubjects: (params = {}) => fetchApi(`/curriculum/subjects?${new URLSearchParams(params)}`),
  getChapters: (params = {}) => fetchApi(`/curriculum/chapters?${new URLSearchParams(params)}`),
  getTopics: (params = {}) => fetchApi(`/curriculum/topics?${new URLSearchParams(params)}`),
  getSubtopics: (params = {}) => fetchApi(`/curriculum/subtopics?${new URLSearchParams(params)}`),
  getQuestionCount: (params = {}) => fetchApi(`/curriculum/questions/count?${new URLSearchParams(params)}`),
};

export const parentService = {
  list: (params = {}) => fetchApi(`/parents?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/parents", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/parents/${id}`),
  update: (id: string, data: any) => fetchApi(`/parents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/parents/${id}`, { method: "DELETE" }),
  getChildren: (id: string) => fetchApi(`/parents/${id}/children`),
  getChildDashboard: (id: string, childId: string) => fetchApi(`/parents/${id}/children/${childId}/dashboard`),
  verifyStudent: (id: string, studentEmail: string) => fetchApi(`/parents/${id}/verify-student`, { method: "POST", body: JSON.stringify({ studentEmail }) }),
  linkChild: (id: string, studentId: string, studentPassword: string) => fetchApi(`/parents/${id}/link-student`, { method: "POST", body: JSON.stringify({ studentId, studentPassword }) }),
};

export const questionService = {
  list: (params = {}) => fetchApi(`/questions?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/questions", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/questions/${id}`),
  update: (id: string, data: any) => fetchApi(`/questions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/questions/${id}`, { method: "DELETE" }),
};

export const schoolService = {
  list: (params = {}) => fetchApi(`/schools?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/schools", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/schools/${id}`),
  update: (id: string, data: any) => fetchApi(`/schools/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/schools/${id}`, { method: "DELETE" }),
  getStats: (id: string) => fetchApi(`/schools/${id}/stats`),
  listClasses: (id: string) => fetchApi(`/schools/${id}/classes`),
  createClass: (id: string, data: any) => fetchApi(`/schools/${id}/classes`, { method: "POST", body: JSON.stringify(data) }),
  updateClass: (id: string, classId: string, data: any) => fetchApi(`/schools/${id}/classes/${classId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteClass: (id: string, classId: string) => fetchApi(`/schools/${id}/classes/${classId}`, { method: "DELETE" }),
  getClassStudents: (id: string, classId: string) => fetchApi(`/schools/${id}/classes/${classId}/students`),
  listTeachers: (id: string) => fetchApi(`/schools/${id}/teachers`),
  listStudents: (id: string) => fetchApi(`/schools/${id}/students`),
  createStudent: (id: string, data: any) => fetchApi(`/schools/${id}/students`, { method: "POST", body: JSON.stringify(data) }),
  createTeacher: (id: string, data: any) => fetchApi(`/schools/${id}/teachers`, { method: "POST", body: JSON.stringify(data) }),
};

export const studentService = {
  list: (params = {}) => fetchApi(`/students?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/students", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/students/${id}`),
  update: (id: string, data: any) => fetchApi(`/students/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/students/${id}`, { method: "DELETE" }),
  getTests: (id: string, params = {}) => fetchApi(`/students/${id}/tests?${new URLSearchParams(params)}`),
  getDashboard: (id: string) => fetchApi(`/students/${id}/dashboard`),
};

export const teacherService = {
  list: (params = {}) => fetchApi(`/teachers?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/teachers", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/teachers/${id}`),
  update: (id: string, data: any) => fetchApi(`/teachers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/teachers/${id}`, { method: "DELETE" }),
  getStats: (id: string) => fetchApi(`/teachers/${id}/stats`),
  getClasses: (id: string) => fetchApi(`/teachers/${id}/classes`),
  getStudents: (id: string) => fetchApi(`/teachers/${id}/students`),
  getSubjectAnalytics: (id: string) => fetchApi(`/teachers/${id}/analytics/subjects`),
  getTopicMastery: (id: string) => fetchApi(`/teachers/${id}/analytics/topics`),
};

export const testService = {
  list: (params = {}) => fetchApi(`/tests?${new URLSearchParams(params)}`),
  create: (data: any) => fetchApi("/tests", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => fetchApi(`/tests/${id}`),
  autosaveResponse: (id: string, qid: string, data: any) => fetchApi(`/tests/${id}/responses/${qid}`, { method: "PATCH", body: JSON.stringify(data) }),
  submit: (id: string) => fetchApi(`/tests/${id}/submit`, { method: "POST" }),
  generateAI: (data: any) => fetchApi("/tests/generate-ai", { method: "POST", body: JSON.stringify(data) }),
};
