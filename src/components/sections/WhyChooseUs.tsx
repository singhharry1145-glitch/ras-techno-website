import { useWhyChooseUs } from "@/hooks/useWhyChooseUs";
import * as LucideIcons from "lucide-react";
import { Star } from "lucide-react";

const getIcon = (iconName: string | null) => {
  if (!iconName) return Star;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Star;
};

const WhyChooseUs = () => {
  const { data: items = [] } = useWhyChooseUs();
  const activeItems = items.filter((i) => i.is_active);

  if (activeItems.length === 0) return null;

  return (
    <section id="why-choose-us" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <p className="text-primary font-semibold mb-2 text-sm sm:text-base">Why Us</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why <span className="text-gradient-secondary">Choose Us?</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Here's what sets us apart from the rest.
          </p>
        </div>

        <div className={`grid gap-6 sm:gap-8 ${
          activeItems.length <= 3 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        } max-w-6xl mx-auto`}>
          {activeItems.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={item.id}
                className="relative p-6 sm:p-8 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-500 group animate-fade-in text-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg sm:text-xl mb-3">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
