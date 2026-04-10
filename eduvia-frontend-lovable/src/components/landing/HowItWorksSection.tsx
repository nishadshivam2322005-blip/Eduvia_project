const steps = [
  { num: "01", title: "Upload Your Content", desc: "Add PDFs, certificates, GitHub links, or YouTube courses you've completed." },
  { num: "02", title: "AI Analyzes Skills", desc: "Our AI extracts and maps your skills, identifying what you know and what's missing." },
  { num: "03", title: "Get Your Roadmap", desc: "Receive a prioritized, personalized learning path with resources and timelines." },
  { num: "04", title: "Track & Level Up", desc: "Follow your roadmap, track progress with visual analytics, and reach your goals." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            How <span className="text-gradient">Eduvia</span> Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four simple steps to transform your learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="text-5xl font-display font-bold text-primary/20 mb-4">{step.num}</div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
