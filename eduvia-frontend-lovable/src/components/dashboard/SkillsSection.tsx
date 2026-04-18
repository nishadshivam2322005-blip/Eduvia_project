// @ts-nocheck
import { useState, useEffect } from "react";
import { TrendingUp, Zap, Award, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySkills } from "@/lib/api";

const statusConfig = {
  mastered: { icon: Award, label: "Mastered", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  learning: { icon: TrendingUp, label: "Learning", color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/20" },
  not_started: { icon: Circle, label: "Not Started", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

const getLevelColor = (level: number) => {
  if (level >= 80) return "from-primary to-primary";
  if (level >= 50) return "from-chart-3 to-chart-3";
  if (level >= 30) return "from-chart-5 to-chart-5";
  return "from-destructive to-destructive";
};

const getStatus = (proficiency: number) => {
  if (proficiency >= 0.8) return "mastered";
  if (proficiency >= 0.3) return "learning";
  return "not_started";
};

// Detect category from skill name since backend doesn't store category yet
const detectCategory = (skillName: string): string => {
  const name = skillName.toLowerCase();
  if (["python", "javascript", "typescript", "java", "c++", "go", "rust", "swift", "kotlin"].some(s => name.includes(s))) return "Programming";
  if (["react", "vue", "angular", "html", "css", "tailwind", "next.js", "svelte"].some(s => name.includes(s))) return "Frontend";
  if (["node", "fastapi", "django", "express", "flask", "spring", "backend"].some(s => name.includes(s))) return "Backend";
  if (["postgresql", "mysql", "mongodb", "redis", "firebase", "database", "sql"].some(s => name.includes(s))) return "Database";
  if (["docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "linux", "devops"].some(s => name.includes(s))) return "DevOps";
  if (["machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "ai", "ml"].some(s => name.includes(s))) return "AI/ML";
  if (["react native", "flutter", "android", "ios", "mobile"].some(s => name.includes(s))) return "Mobile";
  if (["figma", "ui/ux", "design", "canva", "adobe"].some(s => name.includes(s))) return "Design";
  if (["communication", "leadership", "agile", "teamwork", "problem solving"].some(s => name.includes(s))) return "Soft Skills";
  return "Other";
};

const SkillsSection = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    getMySkills()
      .then(res => {
        const formatted = res.data.skills.map((s, i) => ({
          id: String(i),
          name: s.name,
          category: detectCategory(s.name),
          level: Math.round(s.proficiency * 100),
          status: getStatus(s.proficiency),
        }));
        setSkills(formatted);
      })
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(skills.map(s => s.category))];
  const filteredSkills = filterStatus === "all" ? skills : skills.filter(s => s.status === filterStatus);
  const grouped = categories.map(cat => ({
    name: cat,
    skills: filteredSkills.filter(s => s.category === cat),
  })).filter(g => g.skills.length > 0);

  const totalMastered = skills.filter(s => s.status === "mastered").length;
  const totalLearning = skills.filter(s => s.status === "learning").length;
  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading your skills...
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-muted-foreground font-medium">No skills found yet.</p>
        <p className="text-sm text-muted-foreground">Complete onboarding or upload a profile PDF to track your skills.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">{totalMastered}</div>
            <div className="text-xs text-muted-foreground">Skills Mastered</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">{totalLearning}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">{avgLevel}%</div>
            <div className="text-xs text-muted-foreground">Avg. Proficiency</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All Skills" },
          { key: "mastered", label: "Mastered" },
          { key: "learning", label: "Learning" },
          { key: "not_started", label: "Not Started" },
        ].map(f => (
          <Button
            key={f.key}
            variant={filterStatus === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(f.key)}
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {grouped.map(group => (
          <div key={group.name} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === group.name ? null : group.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-display font-semibold text-foreground">{group.name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{group.skills.length}</span>
              </div>
              {expandedCategory === group.name
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>

            {(expandedCategory === group.name || expandedCategory === null) && (
              <div className="px-4 pb-4 space-y-3">
                {group.skills.map(skill => {
                  const config = statusConfig[skill.status];
                  const StatusIcon = config.icon;
                  return (
                    <div key={skill.id} className={`flex items-center gap-4 p-3 rounded-lg border ${config.border} ${config.bg} transition-all hover:shadow-sm`}>
                      <StatusIcon className={`h-5 w-5 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          <span className="text-xs font-semibold text-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(skill.level)} transition-all duration-500`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;