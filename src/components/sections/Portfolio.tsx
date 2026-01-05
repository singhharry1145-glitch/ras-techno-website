import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

const categories = ["All", "Animation & Creative Design", "IT Services & Consultancy", "AI Support & Automation", "Software Development", "Data Analytics"];

// Fallback projects when database is empty
const fallbackProjects = [
  {
    id: "1",
    title: "3D Brand Animation",
    category: "Animation & Creative Design",
    description: "Stunning 3D product visualization and brand storytelling for a tech startup.",
    tags: ["3D Animation", "Motion Graphics", "Brand Identity"],
    image_url: null,
    is_published: true,
    display_order: 1,
  },
  {
    id: "2",
    title: "Enterprise Software Platform",
    category: "IT Services & Consultancy",
    description: "Custom-built enterprise solution with AI-powered analytics and automation.",
    tags: ["Software Development", "Cloud Solutions", "API Integration"],
    image_url: null,
    is_published: true,
    display_order: 2,
  },
  {
    id: "3",
    title: "AI Chatbot Integration",
    category: "AI Support & Automation",
    description: "Intelligent conversational AI system with natural language processing.",
    tags: ["AI/ML", "Automation", "NLP"],
    image_url: null,
    is_published: true,
    display_order: 3,
  },
];

const gradients = [
  "linear-gradient(135deg, hsl(175 80% 50%), hsl(150 60% 50%))",
  "linear-gradient(135deg, hsl(270 60% 55%), hsl(175 80% 50%))",
  "linear-gradient(135deg, hsl(25 90% 60%), hsl(15 85% 55%))",
  "linear-gradient(135deg, hsl(175 80% 50%), hsl(270 60% 55%))",
  "linear-gradient(135deg, hsl(150 60% 50%), hsl(25 90% 60%))",
  "linear-gradient(135deg, hsl(270 60% 55%), hsl(25 90% 60%))",
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: dbProjects, isLoading } = useProjects(true);
  
  // Use database projects if available, otherwise fallback
  const projects = dbProjects && dbProjects.length > 0 ? dbProjects : fallbackProjects;

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-green/3 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-green/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Our Work</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Portfolio of <span className="text-gradient-primary">Excellence</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Explore our diverse range of projects spanning animation, software development, and AI solutions.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12 px-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group rounded-2xl overflow-hidden glass hover:border-primary/30 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Project Image */}
                <div
                  className="h-36 sm:h-44 md:h-48 relative overflow-hidden"
                  style={{ 
                    background: project.image_url 
                      ? `url(${project.image_url}) center/cover` 
                      : gradients[index % gradients.length] 
                  }}
                >
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-primary flex items-center justify-center backdrop-blur-sm shadow-lg">
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-4 sm:p-6">
                  <p className="text-xs font-medium text-primary mb-1 sm:mb-2">{project.category}</p>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{project.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {project.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded-md bg-gradient-to-r from-muted to-muted/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
