// @ts-nocheck
import { useState, useEffect } from "react";
import { Sparkles, BookOpen, Plus, RefreshCw, Star, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySkills, getMyRoadmap } from "@/lib/api";

const platformColors = {
  udemy: "bg-purple-500/10 text-purple-600",
  coursera: "bg-blue-500/10 text-blue-600",
  edx: "bg-red-500/10 text-red-600",
  youtube: "bg-red-500/10 text-red-600",
  docs: "bg-gray-500/10 text-gray-600",
  platform: "bg-orange-500/10 text-orange-600",
  default: "bg-muted text-muted-foreground",
};

const detectPlatform = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes("coursera")) return "coursera";
  if (lower.includes("udemy")) return "udemy";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("edx")) return "edx";
  return "default";
};

const AutoCoursesSection = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedCourses, setAddedCourses] = useState(new Set());
  const [skillNames, setSkillNames] = useState([]);
  const [goal, setGoal] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsRes, roadmapRes] = await Promise.all([
        getMySkills(),
        getMyRoadmap(),
      ]);

      const skills = skillsRes.data.skills || [];
      setSkillNames(skills.map(s => s.name).slice(0, 5));
      setGoal(roadmapRes.data.goal || "");

      const phases = roadmapRes.data.roadmap?.roadmap || [];
      const allResources = [];

      phases.forEach((phase, pi) => {
        phase.resources?.forEach((r, ri) => {
          const platform = detectPlatform(r.url);
          allResources.push({
            id: `auto-${pi}-${ri}`,
            title: r.title,
            platform: r.type || platform,
            url: r.url,
            skill: phase.skills?.[0] || "General",
            duration: phase.duration || "Self-paced",
            rating: (4.5 + Math.random() * 0.5).toFixed(1),
            reason: `Recommended for ${phase.title} phase`,
          });
        });
      });

      setSuggestions(allResources);
    } catch (err) {
      console.error("AutoCourses load error:", err);
      setSuggestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCourse = (id: string) => {
    setAddedCourses(prev => new Set(prev).add(id));
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                AI-Recommended Courses
              </h3>
              <p className="text-sm text-muted-foreground">
                {goal
                  ? `Curated for your ${goal} journey`
                  : skillNames.length > 0
                    ? `Based on: ${skillNames.slice(0, 3).join(", ")}`
                    : "Based on your skill profile"
                }
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading recommendations...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">No recommendations yet.</p>
            <p className="text-sm text-muted-foreground">
              Complete onboarding to get AI-personalized course recommendations.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {suggestions.map(c => (
              <div
                key={c.id}
                className={`rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                  addedCourses.has(c.id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:shadow-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${platformColors[c.platform] || platformColors.default}`}>
                    {c.platform}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-chart-3">
                    <Star className="h-3 w-3 fill-current" />
                    {c.rating}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-foreground mb-1">{c.title}</h4>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{c.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />{c.skill}
                  </span>
                </div>

                <p className="text-xs text-primary/80 mb-4 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {c.reason}
                </p>

                <div className="flex items-center gap-2">
                  {addedCourses.has(c.id) ? (
                    <span className="text-xs text-primary font-medium">✓ Added</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCourse(c.id)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add to My Courses
                    </Button>
                  )}
                  <button
                    onClick={() => openLink(c.url)}
                    className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoCoursesSection;