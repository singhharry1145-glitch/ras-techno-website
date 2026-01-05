import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedBlogs } from "@/hooks/useBlogs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { format } from "date-fns";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blogs, isLoading } = usePublishedBlogs();
  
  const blog = blogs?.find((b) => b.slug === slug);
  const readTime = blog ? Math.ceil(blog.content.split(" ").length / 200) + " min read" : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/#blog">
            <Button variant="gradient">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="pt-24 pb-16">
        {/* Hero */}
        <div className="relative">
          {blog.cover_image ? (
            <div className="h-64 md:h-96 relative overflow-hidden">
              <img 
                src={blog.cover_image} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ) : (
            <div className="h-32 md:h-48 bg-gradient-to-br from-cyan to-magenta" />
          )}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 -mt-16 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Link to="/#blog" className="inline-block mb-6">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            {/* Category */}
            {blog.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                {blog.category}
              </span>
            )}
            
            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {blog.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {blog.author}
              </span>
              {blog.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(blog.published_at), "MMM d, yyyy")}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime}
              </span>
            </div>
            
            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogDetail;
