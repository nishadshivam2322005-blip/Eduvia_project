import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
          Ready to Accelerate Your Career?
        </h2>
        <p className="text-lg text-primary-foreground/70 max-w-lg mx-auto mb-10">
          Join thousands of learners using AI to build the skills that matter most.
        </p>
        <Button variant="hero" size="lg" className="text-base px-10" asChild>
          <Link to="/dashboard">
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
