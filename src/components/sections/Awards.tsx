import { Award, Trophy, Medal, Star } from "lucide-react";
import { useActiveAwards } from "@/hooks/useAwards";

const Awards = () => {
  const { data: awards, isLoading } = useActiveAwards();

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse h-10 w-64 bg-muted rounded mx-auto mb-4" />
            <div className="animate-pulse h-6 w-96 bg-muted rounded mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!awards || awards.length === 0) {
    return null;
  }

  const getIcon = (index: number) => {
    const icons = [Trophy, Award, Medal, Star];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <section id="awards" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            Recognition & Achievements
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Awards &</span>{" "}
            <span className="text-gradient">Certificates</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our commitment to excellence has been recognized through various awards and certifications
          </p>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, index) => (
            <div
              key={award.id}
              className="group relative glass rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground mb-4">
                  {getIcon(index)}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-gradient transition-colors">
                  {award.title}
                </h3>
                
                {award.issuer && (
                  <p className="text-primary text-sm font-medium mb-2">
                    {award.issuer}
                  </p>
                )}
                
                {award.description && (
                  <p className="text-muted-foreground text-sm mb-3">
                    {award.description}
                  </p>
                )}
                
                {award.date_received && (
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(award.date_received).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}

                {/* Image if exists */}
                {award.image_url && (
                  <div className="mt-4">
                    <img
                      src={award.image_url}
                      alt={award.title}
                      className="w-full h-32 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Awards;
