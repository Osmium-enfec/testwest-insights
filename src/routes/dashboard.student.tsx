import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { StudentDashboard } from "@/features/student/StudentDashboard";
import { StudentOnboarding } from "@/features/student/StudentOnboarding";
import { getStudentProfileCompleteness } from "@/features/student/profile-completeness";
import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — TestWest" },
      {
        name: "description",
        content:
          "TestWest student dashboard: track recent performance, weak topics, accuracy, and start a new test.",
      },
      { property: "og:title", content: "Student Dashboard — TestWest" },
      {
        property: "og:description",
        content: "Track recent performance, weak topics, and accuracy on TestWest.",
      },
    ],
  }),
  component: StudentDashboardRoute,
});

function StudentDashboardRoute() {
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useUser();
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (user.role !== "STUDENT") {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "STUDENT") return null;

  const completeness = getStudentProfileCompleteness(user);

  if (!completeness.complete && !bypass) {
    return (
      <StudentOnboarding
        user={user}
        onComplete={() => {
          setBypass(true);
          refetch();
        }}
      />
    );
  }

  return (
    <AppShell
      title="Student dashboard"
      subtitle={user?.profile ? `Grade ${user.profile.grade} · ${user.profile.board}` : "Learner overview"}
      role={user?.role || "STUDENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <StudentDashboard />
    </AppShell>
  );
}
