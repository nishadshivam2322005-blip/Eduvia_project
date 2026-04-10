import { Upload, Brain, BarChart3, Map, Bell, Users } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Upload",
    description: "Upload PDFs, certificates, or paste links. Our AI extracts skills and metadata automatically.",
  },
  {
    icon: Brain,
    title: "AI Skill Analysis",
    description: "Analyze your skills against target roles. Identify gaps and get prioritized learning sequences.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Radar charts, heatmaps, and progress timelines to visualize your learning journey.",
  },
  {
    icon: Map,
    title: "Dynamic Roadmap",
    description: "Drag-and-drop milestone board with personalized step-by-step learning paths.",
  },
  {
    icon: Bell,
    title: "Nudge Engine",
    description: "Smart reminders based on inactivity or missed goals to keep you on track.",
  },
  {
    icon: Users,
    title: "Mentor Dashboard",
    description: "Mentors can monitor student progress, provide feedback, and guide learning.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to <span className="text-gradient">Level Up</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete learning platform powered by AI to accelerate your career growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:animate-pulse_glow transition-all">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
