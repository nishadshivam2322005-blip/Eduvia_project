// @ts-nocheck
import { useState, useEffect } from "react";
import { Plus, ExternalLink, Trash2, GraduationCap, Star, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyRoadmap } from "@/lib/api";

const platformMeta = {
  coursera: { icon: "🎓", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  udemy: { icon: "📚", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  skillshare: { icon: "🎨", color: "bg-green-500/10 text-green-600 border-green-200" },
  youtube: { icon: "▶️", color: "bg-red-500/10 text-red-600 border-red-200" },
  edx: { icon: "🏛️", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
  linkedin: { icon: "💼", color: "bg-sky-500/10 text-sky-600 border-sky-200" },
  docs: { icon: "📄", color: "bg-gray-500/10 text-gray-600 border-gray-200" },
  platform: { icon: "☁️", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  default: { icon: "🔗", color: "bg-muted text-muted-foreground border-border" },
};

const detectPlatform = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes("coursera")) return "coursera";
  if (lower.includes("udemy")) return "udemy";
  if (lower.includes("skillshare")) return "skillshare";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("edx")) return "edx";
  if (lower.includes("linkedin")) return "linkedin";
  return "default";
};

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    getMyRoadmap()
      .then(res => {
        const phases = res.data.roadmap?.roadmap || [];
        const extracted = [];
        phases.forEach((phase, pi) => {
          phase.resources?.forEach((r, ri) => {
            const platform = detectPlatform(r.url);
            const meta = platformMeta[r.type] || platformMeta[platform] || platformMeta.default;
            extracted.push({
              id: `phase-${pi}-res-${ri}`,
              title: r.title,
              platform: r.type || platform,
              url: r.url,
              icon: meta.icon,
              color: meta.color,
              phase: phase.title,
            });
          });
        });
        setCourses(extracted);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const addCourse = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const platform = detectPlatform(newUrl);
    const meta = platformMeta[platform];
    setCourses(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        platform,
        url: newUrl.trim(),
        icon: meta.icon,
        color: meta.color,
      },
    ]);
    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
  };

  const removeCourse = (id: string) => setCourses(prev => prev.filter(c => c.id !== id));

  const openLink = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your courses...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Learning Resources
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Resources from your AI-generated roadmap
          </p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3">
          <Input
            placeholder="Course title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <Input
            placeholder="Course URL"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCourse()}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="default" size="sm" onClick={addCourse}>Add</Button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-muted-foreground">No courses found.</p>
          <p className="text-sm text-muted-foreground">
            Complete onboarding to get AI-recommended courses.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course, i) => (
            <div
              key={course.id}
              className="group bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${course.color}`}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{course.title}</h4>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{course.platform}</p>
                  {course.phase && (
                    <span className="text-xs text-primary/70 mt-1 block">Phase: {course.phase}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openLink(course.url)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesSection;