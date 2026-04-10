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
  { icon: Bell, label: "Notifications", badge: 3 },
];

const mentorSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Students" },
  { icon: Bell, label: "Notifications", badge: 2 },
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [skillCount, setSkillCount] = useState(null);
  const [gapCount, setGapCount] = useState(null);
  const [roadmapProgress, setRoadmapProgress] = useState("0%");
  const [goalName, setGoalName] = useState("");

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
        let totalSkills = 0;
        phases.forEach((phase) => {
          totalSkills += phase.skills?.length || 0;
        });
        setGapCount(totalSkills);
        const donePhases = 1;
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
      change: skillCount ? `${skillCount} skills found` : "Upload PDF to track",
      icon: Target,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Skill Gaps",
      value: gapCount !== null ? gapCount.toString() : "...",
      change: gapCount ? "Skills to learn" : "Complete onboarding",
      icon: Search,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    {
      label: "Roadmap Progress",
      value: roadmapProgress,
      change: goalName ? `Goal: ${goalName}` : "+12% this week",
      icon: Map,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3"
    },
    {
      label: "Days Streak",
      value: "14",
      change: "Personal best! 🔥",
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
                  ? "gradient-primary text-primary-foreground font-medium shadow-glow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === item.label
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-destructive text-destructive-foreground"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="h-9 w-9 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-accent-foreground shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {user?.role} {goalName && `· ${goalName}`}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}

        <div className="p-2 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">{activeTab}</h1>
            {isMentor && <p className="text-xs text-muted-foreground">Mentor View</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-40"
                placeholder="Search..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setActiveTab("Notifications")}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl">

          {/* Student Dashboard */}
          {activeTab === "Dashboard" && !isMentor && (
            <div className="space-y-6 animate-fade-in">

              {/* Welcome card */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card gradient-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
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