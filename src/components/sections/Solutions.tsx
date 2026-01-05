import { Shield, Zap, TrendingUp, Headphones, Users, Target } from "lucide-react";

const benefits = [
  { icon: Shield, title: "Reliability", description: "Battle-tested solutions with 99.9% uptime guarantee", color: "cyan" },
  { icon: Zap, title: "Speed", description: "Rapid development without compromising quality", color: "magenta" },
  { icon: TrendingUp, title: "Scalability", description: "Solutions that grow with your business needs", color: "purple" },
  { icon: Headphones, title: "24/7 Support", description: "Round-the-clock technical assistance", color: "orange" },
  { icon: Users, title: "Expert Team", description: "10+ years of combined industry experience", color: "cyan" },
  { icon: Target, title: "Results-Driven", description: "Focused on delivering measurable outcomes", color: "magenta" },
];

const challenges = [
  { question: "Legacy systems holding you back?", answer: "We modernize your infrastructure with cutting-edge technologies.", color: "cyan" },
  { question: "Need to automate repetitive tasks?", answer: "Our AI and automation solutions free up your team's valuable time.", color: "magenta" },
  { question: "Struggling with data management?", answer: "We build robust data pipelines and analytics platforms.", color: "purple" },
  { question: "Want to enhance user engagement?", answer: "Our creative team designs captivating animations and experiences.", color: "orange" },
  { question: "Looking for custom software?", answer: "We develop tailored solutions from scratch to fit your exact needs.", color: "cyan" },
  { question: "Need technical consultancy?", answer: "Our experts provide strategic guidance for your technology roadmap.", color: "magenta" },
];

const processSteps = [
  { step: "01", title: "Discovery", subtitle: "Understanding your needs", color: "cyan" },
  { step: "02", title: "Strategy", subtitle: "Crafting the solution", color: "magenta" },
  { step: "03", title: "Development", subtitle: "Building with precision", color: "purple" },
  { step: "04", title: "Support", subtitle: "Ongoing optimization", color: "orange" },
];

const Solutions = () => {
  return (
    <section id="solutions" className="py-16 sm:py-20 md:py-24 relative circuit-pattern overflow-hidden">
      {/* Gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/30 to-transparent" />
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Solutions Hub</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            We Solve All <span className="text-gradient-primary">Technical Software Problems</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            No challenge is too complex. From concept to deployment, we provide end-to-end solutions that transform your vision into reality.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-12 sm:mb-20">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="p-3 sm:p-4 rounded-xl glass text-center hover:border-primary/30 transition-all duration-300 animate-fade-in group relative overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                benefit.color === "cyan" ? "bg-gradient-to-br from-cyan/10 to-transparent" :
                benefit.color === "magenta" ? "bg-gradient-to-br from-magenta/10 to-transparent" :
                benefit.color === "purple" ? "bg-gradient-to-br from-purple/10 to-transparent" :
                "bg-gradient-to-br from-orange/10 to-transparent"
              }`} />
              <div className="relative z-10">
                <benefit.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 ${
                  benefit.color === "cyan" ? "text-cyan" :
                  benefit.color === "magenta" ? "text-magenta" :
                  benefit.color === "purple" ? "text-purple" : "text-orange"
                }`} />
                <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">{benefit.title}</h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Challenges Section */}
        <div className="mb-12 sm:mb-20">
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-6 sm:mb-10">
            Common Challenges We <span className="text-gradient-secondary">Solve</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {challenges.map((item, index) => (
              <div
                key={item.question}
                className="p-4 sm:p-6 rounded-xl glass hover:border-primary/30 transition-all duration-300 animate-fade-in relative overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  item.color === "cyan" ? "bg-gradient-to-b from-cyan to-cyan/20" :
                  item.color === "magenta" ? "bg-gradient-to-b from-magenta to-magenta/20" :
                  item.color === "purple" ? "bg-gradient-to-b from-purple to-purple/20" :
                  "bg-gradient-to-b from-orange to-orange/20"
                }`} />
                <h4 className="font-semibold text-sm sm:text-base text-foreground mb-1 sm:mb-2">{item.question}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div>
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-6 sm:mb-10">
            Our Proven <span className="text-gradient-primary">Process</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            {processSteps.map((step, index) => (
              <div key={step.step} className="flex flex-col sm:flex-row items-center">
                <div className="text-center px-4 sm:px-6 py-3 sm:py-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 ${
                    step.color === "cyan" ? "bg-gradient-to-br from-cyan to-cyan/50 shadow-lg shadow-cyan/20" :
                    step.color === "magenta" ? "bg-gradient-to-br from-magenta to-magenta/50 shadow-lg shadow-magenta/20" :
                    step.color === "purple" ? "bg-gradient-to-br from-purple to-purple/50 shadow-lg shadow-purple/20" :
                    "bg-gradient-to-br from-orange to-orange/50 shadow-lg shadow-orange/20"
                  }`}>
                    <span className="font-display text-lg sm:text-xl font-bold text-primary-foreground">{step.step}</span>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.subtitle}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden sm:block w-8 md:w-12 lg:w-16 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
