import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/lib/api/hooks";
import { toast } from "sonner";
import { AlertCircle, Home, Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/signup")({
  component: SignupRoute,
});

function SignupRoute() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | "PARENT" | "SOLO" | "SCHOOL">("STUDENT");
  const [grade, setGrade] = useState("6");
  const [board, setBoard] = useState("CBSE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, isUserLoading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile: any = {};
      if (role === "STUDENT" || role === "SOLO") {
        profile.grade = Number(grade);
        profile.board = board;
      } else if (role === "TEACHER") {
        profile.subjects = ["Mathematics"];
        profile.experienceYears = 0;
      }

      await authService.register({
        email,
        password,
        role,
        firstName,
        lastName,
        profile,
      });

      toast.success("Account created!", { description: "Welcome to TestWest!" });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg = err?.message || "Please check your details and try again";
      setError(msg);
      toast.error("Signup failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header with Home button */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="text-2xl">📚</span>
          TestWest
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="mt-2 text-muted-foreground">Join TestWest to start tracking progress</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-lg">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sign up failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Role selector */}
              <div className="flex p-1 bg-muted rounded-lg overflow-x-auto">
                {(["STUDENT", "SOLO", "TEACHER", "PARENT", "SCHOOL"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap px-3 ${
                      role === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">First name</label>
                  <Input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="John"
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Last name</label>
                  <Input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Doe"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  required 
                />
              </div>

              {(role === "STUDENT" || role === "SOLO") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Grade</label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Board</label>
                    <Select value={board} onValueChange={setBoard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Board" />
                      </SelectTrigger>
                      <SelectContent>
                        {["CBSE", "ICSE", "IGCSE", "IB", "State Board"].map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  minLength={8}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 text-base font-medium">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" /> Sign up as {role.toLowerCase()}</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
