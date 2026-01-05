import { Star, Quote } from "lucide-react";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";

const Testimonials = () => {
  const { data: testimonials, isLoading } = usePublishedTestimonials();

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

  if (!testimonials?.length) return null;

  return (
    <section id="testimonials" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-magenta/5 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-magenta/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-magenta/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-cyan/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Client Testimonials</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            What our <span className="text-gradient-secondary">clients say</span> about us
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="p-6 sm:p-8 rounded-2xl glass hover:border-primary/30 transition-all duration-500 animate-fade-in relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Quote className="w-8 h-8 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Client Info */}
              <div className="flex items-center gap-3">
                {testimonial.client_image ? (
                  <img
                    src={testimonial.client_image}
                    alt={testimonial.client_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan to-magenta flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.client_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">
                    {testimonial.client_name}
                  </h4>
                  {(testimonial.client_position || testimonial.client_company) && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.client_position}
                      {testimonial.client_position && testimonial.client_company && " at "}
                      {testimonial.client_company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
