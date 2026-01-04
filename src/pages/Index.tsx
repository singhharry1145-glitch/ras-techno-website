import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Stats from "@/components/sections/Stats";
import Portfolio from "@/components/sections/Portfolio";
import Services from "@/components/sections/Services";
import Solutions from "@/components/sections/Solutions";
import Clients from "@/components/sections/Clients";
import Blog from "@/components/sections/Blog";
import Journey from "@/components/sections/Journey";
import Awards from "@/components/sections/Awards";
import Consultancy from "@/components/sections/Consultancy";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/effects/ScrollToTop";
import AIBackground from "@/components/effects/AIBackground";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SectionVisibility {
  [key: string]: boolean;
}

const Index = () => {
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  
  const visibility = (settings?.section_visibility as SectionVisibility) || {};
  const isVisible = (key: string) => visibility[key] !== false;

  useEffect(() => {
    // Handle scroll to section when navigating from other pages
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* AI Neural Network Background */}
      <AIBackground />
      
      <Navbar />
      <main className="relative z-10">
        {isVisible("hero") && <Hero />}
        {isVisible("about") && <About />}
        {isVisible("stats") && <Stats />}
        {isVisible("portfolio") && <Portfolio />}
        {isVisible("services") && <Services />}
        {isVisible("solutions") && <Solutions />}
        {isVisible("clients") && <Clients />}
        {isVisible("blog") && <Blog />}
        {isVisible("journey") && <Journey />}
        {isVisible("awards") && <Awards />}
        {isVisible("consultancy") && <Consultancy />}
        {isVisible("contact") && <Contact />}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
