import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // LOGIN → go to dashboard (already has data)
      const ok = await login(email, password);
      if (ok) navigate("/dashboard");
      else setError("Invalid credentials. Please check your email and password.");
    } else {
      // SIGNUP → go to onboarding (needs to fill skills)
      if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
      const ok = await signup(name, email, password, role);
      if (ok) navigate("/onboarding");
      else setError("Signup failed. Email might already be registered.");
    }
    setLoading(false);
  };

  const demoAccounts = [
    { label: "Student (Test)", email: "test@eduvia.com", password: "test123" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">Welcome to Eduvia</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your AI-powered learning companion. Get personalized roadmaps, track skills, and accelerate your career growth.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { val: "10K+", label: "Learners" },
              { val: "500+", label: "Courses" },
              { val: "95%", label: "Success" },
            ].map((s) => (
              <div key={s.label} className="bg-card/50 backdrop-blur rounded-xl p-4 border border-border/50">
                <div className="text-2xl font-display font-bold text-foreground">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Eduvia</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? "Welcome back! Enter your credentials." : "Start your learning journey today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "student" as UserRole, icon: GraduationCap, label: "Student" },
                      { val: "mentor" as UserRole, icon: Users, label: "Mentor" },
                    ].map((r) => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setRole(r.val)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          role === r.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <r.icon className="h-4 w-4" />
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full py-3 text-sm"
              disabled={loading}
            >
              {loading
                ? (isLogin ? "Signing in..." : "Creating account...")
                : (isLogin ? "Sign In" : "Create Account")
              }
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {isLogin && (
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider">
                Quick Demo Access
              </p>
              <div className="grid gap-2">
                {demoAccounts.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => { setEmail(d.email); setPassword(d.password); }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium text-foreground">{d.label}</span>
                      <span className="text-muted-foreground ml-2">{d.email}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;