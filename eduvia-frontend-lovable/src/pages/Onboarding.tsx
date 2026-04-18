// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPDF } from "@/lib/api";
import { BookOpen, Plus, X, Loader2, Link, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const SKILL_SUGGESTIONS = {
  "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"],
  "Frontend": ["React", "Vue.js", "Angular", "HTML/CSS", "Tailwind", "Next.js"],
  "Backend": ["Node.js", "FastAPI", "Django", "Spring Boot", "Express", "Flask"],
  "Database": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase"],
  "DevOps": ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Linux"],
  "AI/ML": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
  "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS"],
  "Design": ["Figma", "UI/UX", "Adobe XD", "Canva", "Wireframing"],
  "Soft Skills": ["Communication", "Leadership", "Problem Solving", "Teamwork", "Agile"],
};

const COURSE_PLATFORMS = [
  { name: "Coursera", placeholder: "https://coursera.org/learn/...", icon: "🎓" },
  { name: "Udemy", placeholder: "https://udemy.com/course/...", icon: "📚" },
  { name: "edX", placeholder: "https://edx.org/course/...", icon: "🏛️" },
  { name: "YouTube", placeholder: "https://youtube.com/watch?v=...", icon: "▶️" },
  { name: "FutureSkills", placeholder: "https://futureskillsprime.in/...", icon: "🚀" },
  { name: "LinkedIn Learning", placeholder: "https://linkedin.com/learning/...", icon: "💼" },
  { name: "Other", placeholder: "Paste any course link...", icon: "🔗" },
];

const CAREER_GOALS = [
  "Full Stack Developer",
  "Data Scientist",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "UI/UX Designer",
  "Backend Developer",
  "Frontend Developer",
  "Cloud Architect",
  "Cybersecurity Engineer",
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [careerGoal, setCareerGoal] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [courseLinks, setCourseLinks] = useState([{ platform: "", url: "", id: Date.now() }]);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCourseLink = () => {
    setCourseLinks(prev => [...prev, { platform: "", url: "", id: Date.now() }]);
  };

  const removeCourseLink = (id) => {
    setCourseLinks(prev => prev.filter(l => l.id !== id));
  };

  const updateLink = (id, field, value) => {
    setCourseLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleFinish = async () => {
    if (!careerGoal) {
      setError("Please select a career goal");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Build a rich detailed skills profile text Claude can easily parse
      const skillsText = `
STUDENT SKILLS PROFILE FOR EDUVIA
====================================
Student Name: ${user?.name || "Student"}
Career Goal: ${careerGoal}

SKILLS I CURRENTLY KNOW (extract ALL of these as my existing skills):
${selectedSkills.join(", ")}

MY SKILLS BROKEN DOWN BY CATEGORY:
${Object.entries(SKILL_SUGGESTIONS).map(([cat, skills]) => {
  const userSkills = skills.filter(s => selectedSkills.includes(s));
  return userSkills.length > 0 ? `${cat}: ${userSkills.join(", ")}` : null;
}).filter(Boolean).join("\n")}

COURSES AND CERTIFICATES I HAVE COMPLETED:
${courseLinks.filter(l => l.url.trim()).map(l => `- ${l.platform || "Course"}: ${l.url}`).join("\n") || "None provided yet"}

MY GOAL:
I want to become a ${careerGoal}. I have listed all my current skills above.
Please analyze these skills, identify what I am missing to reach my goal of
becoming a ${careerGoal}, and generate a detailed personalized learning roadmap
with real course links and resources.

IMPORTANT: Extract EVERY skill I listed above with correct proficiency levels.
Do NOT use generic names like "Core Skill 1". Use exact names like Python, React, TensorFlow etc.
      `.trim();

      const formData = new FormData();

      if (pdfFile) {
        // User uploaded a real PDF certificate - use it directly
        formData.append("file", pdfFile);
      } else {
        // Create a plain text file with skills profile so backend reads it cleanly
        const blob = new Blob([skillsText], { type: "text/plain" });
        const file = new File([blob], "skills-profile.txt", { type: "text/plain" });
        formData.append("file", file);
      }

      await uploadPDF(formData, careerGoal);
      navigate("/dashboard");

    } catch (err: any) {
      console.error("Onboarding error:", err);
      if (err?.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Eduvia</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Let's set up your personalized learning path
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-all ${step >= s ? "bg-primary" : "bg-muted"}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span className={step >= 1 ? "text-primary font-medium" : ""}>Career Goal</span>
          <span className={step >= 2 ? "text-primary font-medium" : ""}>Your Skills</span>
          <span className={step >= 3 ? "text-primary font-medium" : ""}>Courses & Certs</span>
        </div>

        {/* Step 1 - Career Goal */}
        {step === 1 && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              What's your career goal?
            </h2>
            <p className="text-sm text-muted-foreground">
              We'll build a personalized roadmap based on your goal.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CAREER_GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => setCareerGoal(goal)}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    careerGoal === goal
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              variant="hero"
              className="w-full"
              onClick={() => {
                if (!careerGoal) { setError("Please select a career goal"); return; }
                setError("");
                setStep(2);
              }}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2 - Skills */}
        {step === 2 && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              What skills do you already have?
            </h2>
            <p className="text-sm text-muted-foreground">
              Select all that apply. Don't worry — be honest!
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {Object.entries(SKILL_SUGGESTIONS).map(([category, skills]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedSkills.includes(skill)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              Selected: <span className="text-primary font-medium">{selectedSkills.length} skills</span>
              {selectedSkills.length > 0 && (
                <span className="ml-2 text-xs">
                  ({selectedSkills.slice(0, 3).join(", ")}{selectedSkills.length > 3 ? "..." : ""})
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button variant="hero" className="flex-1" onClick={() => setStep(3)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - Courses & PDF */}
        {step === 3 && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Add your courses & certificates
            </h2>
            <p className="text-sm text-muted-foreground">
              Paste links to courses you're enrolled in or completed.
            </p>

            <div className="flex flex-wrap gap-2">
              {COURSE_PLATFORMS.map(p => (
                <button
                  key={p.name}
                  onClick={() => setCourseLinks(prev => [...prev, { platform: p.name, url: "", id: Date.now() }])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                  <Plus className="h-3 w-3" />
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {courseLinks.map((link) => (
                <div key={link.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    {link.platform && (
                      <p className="text-xs text-muted-foreground font-medium">{link.platform}</p>
                    )}
                    <Input
                      placeholder="Paste course URL here..."
                      value={link.url}
                      onChange={e => updateLink(link.id, "url", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeCourseLink(link.id)}
                    className="text-muted-foreground hover:text-destructive mt-6"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addCourseLink}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add another course
            </button>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Or upload a certificate PDF
              </p>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-all">
                <Link className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {pdfFile ? pdfFile.name : "Click to upload PDF certificate"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  "✨ Build My Roadmap"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;