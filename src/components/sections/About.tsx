import { Lightbulb, Cpu, Rocket, Users } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Creative Vision",
    description: "We bring imagination to life through stunning animations and visual storytelling that captivates audiences.",
    color: "cyan",
  },
  {
    icon: Cpu,
    title: "Technical Excellence",
    description: "Cutting-edge IT solutions powered by the latest technologies and best practices in software development.",
    color: "magenta",
  },
  {
    icon: Rocket,
    title: "Innovation First",
    description: "We stay ahead of the curve, embracing AI, automation, and emerging technologies to solve complex problems.",
    color: "purple",
  },
  {
    icon: Users,
    title: "Client-Centric",
    description: "Your success is our mission. We provide end-to-end support and consultancy tailored to your unique needs.",
    color: "orange",
  },
];

const About = () => {
  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple/3 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green/40 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-teal/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">About Us</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Where Creativity Meets <span className="text-gradient-secondary">Technology</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            RaS Techno is a pioneering consultancy that bridges the gap between artistic expression and technical innovation. We're not just service providers—we're your partners in transformation.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-5 sm:p-6 rounded-2xl glass hover:border-primary/30 transition-all duration-500 animate-fade-in relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                feature.color === "cyan" ? "bg-gradient-to-br from-cyan/5 to-transparent" :
                feature.color === "magenta" ? "bg-gradient-to-br from-magenta/5 to-transparent" :
                feature.color === "purple" ? "bg-gradient-to-br from-purple/5 to-transparent" :
                "bg-gradient-to-br from-orange/5 to-transparent"
              }`} />
              
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 transition-all duration-300 group-hover:scale-110 ${
                    feature.color === "cyan"
                      ? "bg-gradient-to-br from-cyan/20 to-cyan/5 text-cyan group-hover:shadow-lg group-hover:shadow-cyan/20"
                      : feature.color === "magenta"
                      ? "bg-gradient-to-br from-magenta/20 to-magenta/5 text-magenta group-hover:shadow-lg group-hover:shadow-magenta/20"
                      : feature.color === "purple"
                      ? "bg-gradient-to-br from-purple/20 to-purple/5 text-purple group-hover:shadow-lg group-hover:shadow-purple/20"
                      : "bg-gradient-to-br from-orange/20 to-orange/5 text-orange group-hover:shadow-lg group-hover:shadow-orange/20"
                  }`}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl glass border border-primary/10">
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
            We Solve All <span className="text-gradient-primary">Technical Software Problems</span>
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 max-w-2xl mx-auto">
            From concept to deployment, we provide comprehensive solutions that combine creative design, robust development, and ongoing support.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
