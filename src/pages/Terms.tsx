import { useSiteSetting } from "@/hooks/useSiteSettings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIBackground from "@/components/effects/AIBackground";
import ScrollToTop from "@/components/effects/ScrollToTop";

const Terms = () => {
  const { data: content, isLoading } = useSiteSetting("terms_conditions");

  const defaultContent = {
    title: "Terms & Conditions",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `
## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.

## Use License

Permission is granted to temporarily download one copy of the materials on RaS Techno's website for personal, non-commercial transitory viewing only.

## Disclaimer

The materials on RaS Techno's website are provided on an 'as is' basis. RaS Techno makes no warranties, expressed or implied.

## Limitations

In no event shall RaS Techno be liable for any damages arising out of the use or inability to use the materials on this website.

## Governing Law

These terms and conditions are governed by and construed in accordance with applicable laws.

## Contact Information

If you have any questions about these Terms & Conditions, please contact us.
    `,
  };

  const termsContent = (content as typeof defaultContent) || defaultContent;

  return (
    <div className="min-h-screen bg-background relative">
      <AIBackground />
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="glass rounded-2xl p-6 sm:p-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {termsContent.title}
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {termsContent.lastUpdated}
            </p>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div
                  className="text-muted-foreground space-y-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:mt-6 [&>h2]:mb-3 [&>p]:leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: termsContent.content
                      .replace(/## (.*)/g, "<h2>$1</h2>")
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/^/, "<p>")
                      .replace(/$/, "</p>"),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Terms;
