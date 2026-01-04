import { useSiteSetting } from "@/hooks/useSiteSettings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIBackground from "@/components/effects/AIBackground";
import ScrollToTop from "@/components/effects/ScrollToTop";

const CookiePolicy = () => {
  const { data: content, isLoading } = useSiteSetting("cookie_policy");

  const defaultContent = {
    title: "Cookie Policy",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `
## What Are Cookies

Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently.

## How We Use Cookies

We use cookies to understand how you use our website and to improve your experience. This includes personalizing content and remembering your preferences.

## Types of Cookies We Use

- Essential Cookies: Required for the website to function properly
- Analytics Cookies: Help us understand how visitors interact with our website
- Preference Cookies: Remember your settings and preferences

## Managing Cookies

You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience.

## Changes to This Policy

We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.

## Contact Us

If you have any questions about our Cookie Policy, please contact us.
    `,
  };

  const cookieContent = (content as typeof defaultContent) || defaultContent;

  return (
    <div className="min-h-screen bg-background relative">
      <AIBackground />
      <Navbar />
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="glass rounded-2xl p-6 sm:p-10">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {cookieContent.title}
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {cookieContent.lastUpdated}
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
                    __html: cookieContent.content
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

export default CookiePolicy;
