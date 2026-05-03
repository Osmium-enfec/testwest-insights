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
      // Logic to handle auto-refresh tokens can easily be integrated here
      localStorage.removeItem("testwest_token");
      if (typeof window !== "undefined") window.location.href = "/";
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "An error occurred with the API.");
  }

  return response.json();
}
