// @ts-nocheck
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Send, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import API from "@/lib/api";

const getBarColor = (level: number) => {
  if (level >= 75) return "hsl(165, 80%, 38%)";
  if (level >= 50) return "hsl(45, 95%, 55%)";
  return "hsl(0, 84%, 60%)";
};

const MentorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    // Load all students from backend
    API.get("/auth/students")
      .then(res => {
        const list = res.data.students || [];
        setStudents(list);
        if (list.length > 0) setSelectedStudent(list[0]);
      })
      .catch(() => {
        // Fallback — show mentor's own data
        setStudents([{
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: "student",
          career_goal: "Full Stack Developer"
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    API.get(`/auth/student-skills/${selectedStudent.id}`)
      .then(res => {
        const skills = res.data.skills || [];
        setStudentSkills(skills.map(s => ({
          skill: s.name,
          level: Math.round(s.proficiency * 100)
        })));
      })
      .catch(() => setStudentSkills([]));
  }, [selectedStudent]);

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback("");
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const progressData = [
    { month: "Jan", progress: 10 },
    { month: "Feb", progress: 25 },
    { month: "Mar", progress: 40 },
    { month: "Apr", progress: 55 },
    { month: "May", progress: 70 },
    { month: "Jun", progress: studentSkills.length > 0 ? Math.round(studentSkills.reduce((a, s) => a + s.level, 0) / studentSkills.length) : 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading student data...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">No students registered yet.</p>
        <p className="text-sm text-muted-foreground">Students will appear here once they sign up.</p>
      </div>
    );
  }

  const latestProgress = progressData[progressData.length - 1]?.progress || 0;
  const skillsLearned = studentSkills.filter(s => s.level >= 60).length;
  const needsAttention = studentSkills.filter(s => s.level < 50).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student selector */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Your Students ({students.length})
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {students.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedStudent?.id === s.id
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-accent-foreground shrink-0">
                {s.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.career_goal || s.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Progress</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{latestProgress}%</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Skills Learned</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{skillsLearned}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            <span className="text-xs text-muted-foreground">Needs Attention</span>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{needsAttention}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">Progress Over Time</h3>
          <p className="text-sm text-muted-foreground mb-4">{selectedStudent?.name}'s learning journey</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="progress" name="Progress %" stroke="hsl(165,80%,38%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(165,80%,38%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">Skill Levels</h3>
          <p className="text-sm text-muted-foreground mb-4">🟢 Strong  🟡 Moderate  🔴 Weak</p>
          {studentSkills.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No skill data for this student yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={studentSkills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} width={90} />
                <Tooltip />
                <Bar dataKey="level" radius={[0, 6, 6, 0]}>
                  {studentSkills.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold text-foreground">
            Send Feedback to {selectedStudent?.name}
          </h3>
        </div>
        {feedbackSent && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Feedback sent successfully!
          </div>
        )}
        <div className="flex gap-3">
          <input
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Write your feedback or suggestion..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            onKeyDown={e => e.key === "Enter" && sendFeedback()}
          />
          <Button variant="hero" size="sm" onClick={sendFeedback}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;