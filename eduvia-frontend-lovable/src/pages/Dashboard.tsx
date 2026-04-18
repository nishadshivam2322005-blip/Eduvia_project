// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, Upload, Map, Users, Bell, Target, ChevronLeft, ChevronRight, GraduationCap, Search, LogOut, Sparkles } from "lucide-react";
import { SkillRadarChart, SkillHeatmap, ProgressTimeline } from "@/components/dashboard/Charts";
import UploadSection from "@/components/dashboard/UploadSection";
import RoadmapBoard from "@/components/dashboard/RoadmapBoard";
import CoursesSection from "@/components/dashboard/CoursesSection";
import SkillsSection from "@/components/dashboard/SkillsSection";
import NotificationsSection from "@/components/dashboard/NotificationsSection";
import MentorDashboard from "@/components/dashboard/MentorDashboard";
import AutoCoursesSection from "@/components/dashboard/AutoCoursesSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMySkills, getMyRoadmap } from "@/lib/api";

const studentSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Upload, label: "Uploads" },
  { icon: Target, label: "Skills" },
  { icon: GraduationCap, label: "Courses" },
  { icon: Sparkles, label: "For You" },
  { icon: Map, label: "Roadmap" },
  { icon: Bell, label: "Notifications" },
];

const mentorSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Students" },
  { icon: Bell, label: "Notifications" },
];

// Calculate login streak from localStorage
const getLoginStreak = () => {
  const today = new Date().toDateString();
  const lastLogin = localStorage.getItem("eduvia_last_login");
  const streakStr = localStorage.getItem("eduvia_streak") || "1";
  let streak = parseInt(streakStr);

  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastLogin === yesterday.toDateString()) {
      streak = streak + 1;
    } else if (!lastLogin) {
      streak = 1;
    } else {
      streak = 1; // streak broken
    }
    localStorage.setItem("eduvia_last_login", today);
    localStorage.setItem("eduvia_streak", String(streak));
  }

  return streak;
};

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [skillCount, setSkillCount] = useState(null);
  const [gapCount, setGapCount] = useState(null);
  const [roadmapProgress, setRoadmapProgress] = useState("0%");
  const [goalName, setGoalName] = useState("");
  const [streak] = useState(() => getLoginStreak());

  const isMentor = user?.role === "mentor";
  const sidebarItems = isMentor ? mentorSidebarItems : studentSidebarItems;

  useEffect(() => {
    getMySkills()
      .then(res => setSkillCount(res.data.skills.length))
      .catch(() => setSkillCount(0));

    getMyRoadmap()
      .then(res => {
        const phases = res.data.roadmap?.roadmap || [];
        setGoalName(res.data.goal || "");

        // FIX: gapCount = number of roadmap phases (learning stages needed)
        setGapCount(phases.length);

        // FIX: progress based on how many phases are "done" (first phase = in progress)
        const donePhases = 0; // none done yet for a new user
        const progress = phases.length > 0
          ? Math.round((donePhases / phases.length) * 100)
          : 0;
        setRoadmapProgress(`${progress}%`);
      })
      .catch(() => {
        setGapCount(0);
        setRoadmapProgress("0%");
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    {
      label: "Skills Tracked",
      value: skillCount !== null ? skillCount.toString() : "...",
      change: skillCount ? `${skillCount} skills found` : "Upload profile to track",
      icon: Target,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Learning Phases",
      value: gapCount !== null ? gapCount.toString() : "...",
      change: gapCount ? `${gapCount} phases to complete` : "Complete onboarding",
      icon: Search,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    {
      label: "Roadmap Progress",
      value: roadmapProgress,
      change: goalName ? `Goal: ${goalName}` : "Complete onboarding",
      icon: Map,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3"
    },
    {
      label: "Days Streak",
      value: String(streak),
      change: streak >= 7 ? "Amazing streak! 🔥" : streak >= 3 ? "Keep it up! 💪" : "Just started!",
      icon: GraduationCap,
      iconBg: "bg-accent/10",
      iconColor: "text-accent"
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-2 border-b border-border h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-display font-bold text-lg text-foreground">Eduvia</span>}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              {isMentor ? "Mentor Menu" : "Menu"}
            </p>
          )}
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                activeTab === item.label
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t border-border">
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isMentor ? "Mentor" : "Student"} · {user?.career_goal || goalName || "Set your goal"}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-24 -right-3 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
            : <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          }
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-lg font-display font-semibold text-foreground">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search..."
                className="h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Dashboard Tab */}
          {activeTab === "Dashboard" && !isMentor && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome banner */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Welcome back, {user?.name?.split(" ")[0]}! 👋
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {goalName
                        ? `Working towards: ${goalName}`
                        : "Complete onboarding to get your personalized roadmap"
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/onboarding")}
                    >
                      Update Profile
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => setActiveTab("Roadmap")}
                    >
                      Continue Learning →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    <div className="text-xs text-primary font-medium mt-1">{stat.change}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <SkillRadarChart />
                <SkillHeatmap />
              </div>
              <ProgressTimeline />
            </div>
          )}

          {/* Mentor Dashboard */}
          {activeTab === "Dashboard" && isMentor && <MentorDashboard />}
          {activeTab === "Students" && isMentor && <MentorDashboard />}

          {/* Student tabs */}
          {activeTab === "Uploads" && !isMentor && (
            <div className="max-w-2xl animate-fade-in">
              <UploadSection />
            </div>
          )}
          {activeTab === "Skills" && !isMentor && <SkillsSection />}
          {activeTab === "Courses" && !isMentor && <CoursesSection />}
          {activeTab === "For You" && !isMentor && <AutoCoursesSection />}
          {activeTab === "Roadmap" && !isMentor && (
            <div className="max-w-3xl animate-fade-in">
              <RoadmapBoard />
            </div>
          )}
          {activeTab === "Notifications" && <NotificationsSection />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;