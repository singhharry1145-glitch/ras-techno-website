import { useActiveClients } from "@/hooks/useClients";

const Clients = () => {
  const { data: clients, isLoading } = useActiveClients();

  const colors = ["cyan", "magenta", "purple", "orange"];

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

  if (!clients?.length) return null;

  return (
    <section id="clients" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple/5 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-purple/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-teal/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Trusted by Industry Leaders</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            We're proud to partner with <span className="text-gradient-secondary">innovative companies</span> across diverse sectors
          </h2>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {clients.map((client, index) => {
            const color = colors[index % colors.length];
            return (
              <div
                key={client.id}
                className="p-4 sm:p-6 rounded-xl glass hover:border-primary/30 transition-all duration-300 text-center group animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  color === "cyan" ? "bg-gradient-to-br from-cyan/15 to-transparent" :
                  color === "magenta" ? "bg-gradient-to-br from-magenta/15 to-transparent" :
                  color === "purple" ? "bg-gradient-to-br from-purple/15 to-transparent" :
                  "bg-gradient-to-br from-orange/15 to-transparent"
                }`} />
                <div className="relative z-10">
                  {client.logo_url ? (
                    <img src={client.logo_url} alt={client.name} className="w-12 h-12 mx-auto mb-2 object-contain" />
                  ) : (
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-${color} to-purple flex items-center justify-center text-primary-foreground font-bold`}>
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <div className={`font-display text-base sm:text-lg font-semibold transition-colors text-foreground group-hover:text-${color}`}>
                    {client.name}
                  </div>
                  {client.description && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
                      {client.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl glass inline-block mx-auto w-full max-w-md">
          <p className="text-sm sm:text-lg text-muted-foreground">
            Join <span className="text-gradient-primary font-semibold">{clients.length}+</span> companies transforming their digital presence
          </p>
        </div>
      </div>
    </section>
  );
};

export default Clients;
