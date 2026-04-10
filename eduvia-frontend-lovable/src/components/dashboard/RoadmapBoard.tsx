// @ts-nocheck
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, CheckCircle, Clock, Circle, ExternalLink } from "lucide-react";
import { getMyRoadmap } from "@/lib/api";

const fallbackMilestones = [
  {
    id: "m1",
    title: "TypeScript Fundamentals",
    description: "Master advanced TS patterns",
    status: "done",
    duration: "1 week",
    skills: ["TypeScript"],
    resources: [{ title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs" }]
  },
  {
    id: "m2",
    title: "Node.js Deep Dive",
    description: "Backend APIs with Express",
    status: "in_progress",
    duration: "2 weeks",
    skills: ["Node.js", "Express"],
    resources: [{ title: "Node.js Docs", url: "https://nodejs.org/docs" }]
  },
  {
    id: "m3",
    title: "Database Design",
    description: "PostgreSQL and schema design",
    status: "todo",
    duration: "1 week",
    skills: ["PostgreSQL", "SQL"],
    resources: [{ title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com" }]
  },
  {
    id: "m4",
    title: "DevOps Essentials",
    description: "Docker, CI/CD pipelines",
    status: "todo",
    duration: "3 weeks",
    skills: ["Docker", "CI/CD"],
    resources: [{ title: "Docker Docs", url: "https://docs.docker.com" }]
  },
];

const statusIcon = (status) => {
  if (status === "done") return <CheckCircle className="h-5 w-5 text-primary" />;
  if (status === "in_progress") return <Clock className="h-5 w-5 text-chart-3" />;
  return <Circle className="h-5 w-5 text-muted-foreground" />;
};

const statusBg = (status) => {
  if (status === "done") return "border-l-primary";
  if (status === "in_progress") return "border-l-chart-3";
  return "border-l-muted";
};

const RoadmapBoard = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [nextSkill, setNextSkill] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyRoadmap();
        const data = res.data;
        setGoal(data.goal || "");
        setTotalDuration(data.roadmap?.total_duration || "");
        setNextSkill(data.roadmap?.next_skill || "");

        const phases = data.roadmap?.roadmap || [];
        if (phases.length > 0) {
          const formatted = phases.map((phase, i) => ({
            id: "phase-" + i,
            title: phase.title || "Phase " + (i + 1),
            description: phase.milestone || "",
            status: i === 0 ? "in_progress" : "todo",
            duration: phase.duration || "",
            skills: phase.skills || [],
            resources: phase.resources || [],
          }));
          setMilestones(formatted);
        } else {
          setMilestones(fallbackMilestones);
        }
      } catch (err) {
        console.error("Roadmap load error:", err);
        setMilestones(fallbackMilestones);
      }
      setLoading(false);
    }
    load();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(milestones);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setMilestones(reordered);
  };

  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="text-center text-muted-foreground py-8 text-sm">
          Loading your roadmap...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-foreground">
          Learning Roadmap
        </h3>
        <p className="text-sm text-muted-foreground">
          Drag to reorder your milestones
        </p>
      </div>

      {(goal || totalDuration || nextSkill) && (
        <div className="grid grid-cols-3 gap-3">
          {goal && (
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Goal</p>
              <p className="text-sm font-semibold text-primary truncate">{goal}</p>
            </div>
          )}
          {totalDuration && (
            <div className="bg-chart-3/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="text-sm font-semibold text-chart-3">{totalDuration}</p>
            </div>
          )}
          {nextSkill && (
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Learn Next</p>
              <p className="text-sm font-semibold text-accent truncate">{nextSkill}</p>
            </div>
          )}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="roadmap">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {milestones.map((m, i) => (
                <Draggable key={m.id} draggableId={m.id} index={i}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 rounded-lg bg-background border border-border border-l-4 ${statusBg(m.status)} transition-shadow ${snapshot.isDragging ? "shadow-elevated" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {statusIcon(m.status)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">
                            {m.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.description}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md whitespace-nowrap">
                          {m.duration}
                        </span>
                      </div>

                      {m.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 ml-10">
                          {m.skills.map((skill, j) => (
                            <span
                              key={j}
                              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {m.resources.length > 0 && (
                        <div className="mt-2 ml-10 space-y-1">
                          {m.resources.map((r, k) => (
                            <button
                              key={k}
                              onClick={() => openLink(r.url)}
                              className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {r.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default RoadmapBoard;