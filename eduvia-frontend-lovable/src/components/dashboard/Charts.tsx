// @ts-nocheck
import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { AreaChart, Area } from "recharts";
import { getMySkills, getMyRoadmap } from "@/lib/api";

const getHeatColor = (gap: number) => {
  if (gap >= 30) return "hsl(0, 84%, 60%)";
  if (gap >= 20) return "hsl(35, 95%, 55%)";
  if (gap >= 10) return "hsl(45, 95%, 55%)";
  return "hsl(165, 80%, 38%)";
};

const SkillRadarChart = () => {
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySkills()
      .then(res => {
        const skills = res.data.skills;
        if (skills.length > 0) {
          setRadarData(skills.map(s => ({
            skill: s.name,
            current: Math.round(s.proficiency * 100),
            required: Math.min(Math.round(s.proficiency * 100) + 20, 100)
          })));
        } else {
          setRadarData([]);
        }
      })
      .catch(() => setRadarData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">Skills Radar</h3>
      <p className="text-sm text-muted-foreground mb-4">Current vs Required proficiency</p>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          Loading skills...
        </div>
      ) : radarData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No skills yet — complete onboarding to see your radar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
            <Radar name="Current" dataKey="current" stroke="hsl(165,80%,38%)" fill="hsl(165,80%,38%)" fillOpacity={0.3} />
            <Radar name="Required" dataKey="required" stroke="hsl(255,70%,55%)" fill="hsl(255,70%,55%)" fillOpacity={0.15} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const SkillHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRoadmap()
      .then(res => {
        const phases = res.data.roadmap?.roadmap || [];
        if (phases.length > 0) {
          const formatted = [];
          phases.forEach(phase => {
            phase.skills?.forEach(skill => {
              formatted.push({
                skill,
                gap: phase.phase === 1 ? 35 : phase.phase === 2 ? 20 : 10
              });
            });
          });
          setHeatmapData(formatted.slice(0, 10));
        } else {
          setHeatmapData([]);
        }
      })
      .catch(() => setHeatmapData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">Skill Gap Heatmap</h3>
      <p className="text-sm text-muted-foreground mb-4">Weakest areas need the most attention</p>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          Loading gaps...
        </div>
      ) : heatmapData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No gap data yet — complete onboarding to see your heatmap
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={heatmapData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
            <YAxis dataKey="skill" type="category" tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} width={120} />
            <Tooltip />
            <Bar dataKey="gap" radius={[0, 6, 6, 0]}>
              {heatmapData.map((entry, i) => (
                <Cell key={i} fill={getHeatColor(entry.gap)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const ProgressTimeline = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySkills()
      .then(res => {
        const skills = res.data.skills || [];
        const total = skills.length;
        if (total > 0) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          const data = months.map((month, i) => ({
            month,
            skills: Math.round((total / months.length) * (i + 1))
          }));
          setProgressData(data);
        } else {
          setProgressData([]);
        }
      })
      .catch(() => setProgressData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">Learning Progress</h3>
      <p className="text-sm text-muted-foreground mb-4">Skills growth over time</p>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          Loading progress...
        </div>
      ) : progressData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No progress data yet — complete onboarding first
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,46%)" }} />
            <Tooltip />
            <Area type="monotone" dataKey="skills" stroke="hsl(165,80%,38%)" fill="hsl(165,80%,38%)" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export { SkillRadarChart, SkillHeatmap, ProgressTimeline };