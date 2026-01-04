import { useSiteSetting } from "@/hooks/useSiteSettings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIBackground from "@/components/effects/AIBackground";
import ScrollToTop from "@/components/effects/ScrollToTop";

const PrivacyPolicy = () => {
  const { data: content, isLoading } = useSiteSetting("privacy_policy");

  const defaultContent = {
    title: "Privacy Policy",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `
## Information We Collect

We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us.

## How We Use Your Information

We use the information we collect to provide, maintain, and improve our services, and to communicate with you.

## Information Sharing

We do not share your personal information with third parties except as described in this policy or with your consent.

## Security

We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.

## Contact Us

If you have any questions about this Privacy Policy, please contact us.
    `,
  };

  const policyContent = (content as typeof defaultContent) || defaultContent;

  return (
    <div className="min-h-screen bg-background relative">
      <AIBackground />
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="glass rounded-2xl p-6 sm:p-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {policyContent.title}
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {policyContent.lastUpdated}
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
                    __html: policyContent.content
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

export default PrivacyPolicy;
