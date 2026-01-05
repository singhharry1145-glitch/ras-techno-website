import { ArrowRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedBlogs } from "@/hooks/useBlogs";
import { Link } from "react-router-dom";

const Blog = () => {
  const { data: blogs, isLoading } = usePublishedBlogs();

  const gradients = [
    { gradient: "from-cyan to-purple", color: "cyan" },
    { gradient: "from-magenta to-orange", color: "magenta" },
    { gradient: "from-purple to-cyan", color: "purple" },
  ];

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (!blogs?.length) return null;

  return (
    <section id="blog" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-teal/5 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-teal/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-purple/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-cyan/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Insights & Stories</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Explore our latest thoughts on <span className="text-gradient-primary">animation, technology, and innovation</span>
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {blogs.slice(0, 6).map((blog, index) => {
            const style = gradients[index % gradients.length];
            const readTime = Math.ceil(blog.content.split(" ").length / 200) + " min read";
            
            return (
              <article
                key={blog.id}
                className="group rounded-2xl overflow-hidden glass hover:border-primary/30 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Article Image */}
                <div className={`h-36 sm:h-44 md:h-48 bg-gradient-to-br ${style.gradient} relative overflow-hidden`}>
                  {blog.cover_image && (
                    <img src={blog.cover_image} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors" />
                  {blog.category && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-sm ${
                        style.color === "cyan" ? "bg-cyan/20 text-cyan border border-cyan/30" :
                        style.color === "magenta" ? "bg-magenta/20 text-magenta border border-magenta/30" :
                        "bg-purple/20 text-purple border border-purple/30"
                      }`}>
                        {blog.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {blog.excerpt || blog.content.substring(0, 150) + "..."}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readTime}
                    </span>
                  </div>

                  <Link to={`/blog/${blog.slug}`} className="w-full">
                    <Button variant="ghost" size="sm" className="group/btn w-full text-xs sm:text-sm">
                      Read More
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Blog;
