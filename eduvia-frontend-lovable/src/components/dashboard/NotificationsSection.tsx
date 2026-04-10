// @ts-nocheck
import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Clock, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySkills, getMyRoadmap } from "@/lib/api";

const typeConfig = {
  nudge: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-l-chart-3", label: "Nudge" },
  milestone: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", border: "border-l-primary", label: "Milestone" },
  warning: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-l-destructive", label: "Alert" },
  info: { icon: Info, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-l-chart-4", label: "Info" },
};

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function generateNotifications() {
      try {
        const [skillsRes, roadmapRes] = await Promise.all([
          getMySkills(),
          getMyRoadmap(),
        ]);

        const skills = skillsRes.data.skills || [];
        const roadmap = roadmapRes.data;
        const phases = roadmap.roadmap?.roadmap || [];
        const goal = roadmap.goal || "your goal";
        const nextSkill = roadmap.roadmap?.next_skill || "";

        const generated = [];

        // Milestone — skills found
        if (skills.length > 0) {
          generated.push({
            id: "milestone-1",
            type: "milestone",
            title: `${skills.length} Skills Detected! 🎉`,
            message: `Claude AI successfully analyzed your profile and found ${skills.length} skills. Your learning journey has begun!`,
            time: "Just now",
            read: false,
          });
        }

        // Info — career goal set
        if (goal) {
          generated.push({
            id: "info-goal",
            type: "info",
            title: `Career Goal Set: ${goal}`,
            message: `Your personalized roadmap has been generated for ${goal}. Check the Roadmap tab to see your learning path.`,
            time: "Just now",
            read: false,
          });
        }

        // Nudge — next skill to learn
        if (nextSkill) {
          generated.push({
            id: "nudge-next",
            type: "nudge",
            title: `Start Learning: ${nextSkill}`,
            message: `Based on your skill analysis, ${nextSkill} is the most important skill to learn right now for ${goal}.`,
            time: "Just now",
            read: false,
          });
        }

        // Warning — low proficiency skills
        const weakSkills = skills.filter(s => s.proficiency < 0.4);
        if (weakSkills.length > 0) {
          generated.push({
            id: "warning-weak",
            type: "warning",
            title: `${weakSkills.length} Skills Need Improvement`,
            message: `${weakSkills.map(s => s.name).join(", ")} ${weakSkills.length === 1 ? "is" : "are"} below 40% proficiency. Focus on these to accelerate your progress.`,
            time: "Today",
            read: false,
          });
        }

        // Milestone — roadmap generated
        if (phases.length > 0) {
          generated.push({
            id: "milestone-roadmap",
            type: "milestone",
            title: `${phases.length}-Phase Roadmap Generated! 🗺️`,
            message: `Your personalized learning roadmap has ${phases.length} phases. Total estimated duration: ${roadmap.roadmap?.total_duration || "a few weeks"}.`,
            time: "Today",
            read: false,
          });
        }

        // Info per phase
        phases.forEach((phase, i) => {
          generated.push({
            id: `phase-info-${i}`,
            type: "info",
            title: `Phase ${phase.phase}: ${phase.title}`,
            message: `This phase covers: ${phase.skills?.join(", ")}. Estimated time: ${phase.duration}. Milestone: ${phase.milestone}`,
            time: `Phase ${phase.phase}`,
            read: true,
          });
        });

        // Nudge — streak reminder
        generated.push({
          id: "nudge-streak",
          type: "nudge",
          title: "Keep Your Learning Streak! 🔥",
          message: "Consistent daily practice is the fastest way to reach your goals. Even 30 minutes a day makes a huge difference.",
          time: "Daily reminder",
          read: true,
        });

        setNotifications(generated);
      } catch (err) {
        console.error("Notifications error:", err);
        setNotifications([{
          id: "info-welcome",
          type: "info",
          title: "Welcome to Eduvia! 👋",
          message: "Complete the onboarding to get personalized notifications based on your skills and goals.",
          time: "Just now",
          read: false,
        }]);
      }
      setLoading(false);
    }

    generateNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "nudge", label: "Nudges" },
          { key: "milestone", label: "Milestones" },
          { key: "warning", label: "Alerts" },
          { key: "info", label: "Info" },
        ].map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications to show</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={`flex gap-4 p-4 rounded-xl border border-l-4 ${config.border} bg-card shadow-card transition-all duration-300 hover:shadow-elevated ${!n.read ? "ring-1 ring-primary/10" : "opacity-80"}`}
              >
                <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;