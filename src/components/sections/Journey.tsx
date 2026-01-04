import { useActiveJourneyMilestones } from "@/hooks/useJourneyMilestones";
import { Star, Rocket, Award, Flag, Target, Zap } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star,
  Rocket,
  Award,
  Flag,
  Target,
  Zap,
};

const Journey = () => {
  const { data: milestones, isLoading } = useActiveJourneyMilestones();

  if (isLoading) {
    return (
      <section id="journey" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <section id="journey" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-magenta/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-gradient-primary">Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The milestones that shaped who we are today
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan via-magenta to-purple transform sm:-translate-x-1/2" />

          {milestones.map((milestone, index) => {
            const IconComponent = iconMap[milestone.icon || "Star"] || Star;
            const isEven = index % 2 === 0;

            return (
              <div
                key={milestone.id}
                className={`relative flex items-center mb-8 sm:mb-12 ${
                  isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div
                  className={`ml-12 sm:ml-0 sm:w-1/2 ${
                    isEven ? "sm:pr-12 sm:text-right" : "sm:pl-12 sm:text-left"
                  }`}
                >
                  <div className="glass p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 group">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
                      {milestone.year}
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-gradient-primary transition-colors">
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Icon Node */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan to-magenta flex items-center justify-center z-10 shadow-lg shadow-cyan/20">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Journey;
