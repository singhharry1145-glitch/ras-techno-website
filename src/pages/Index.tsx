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
import CTABlock from "@/components/sections/CTABlock";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/effects/ScrollToTop";
import FloatingWhatsApp from "@/components/effects/FloatingWhatsApp";
import AIBackground from "@/components/effects/AIBackground";
import Floating3DObjects from "@/components/effects/Floating3DObjects";
import CustomSection from "@/components/sections/CustomSection";
import ITSolutions from "@/components/sections/ITSolutions";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SectionVisibility {
  [key: string]: boolean;
}

interface CustomSectionData {
  id: string;
  name: string;
  content: string;
  videoUrl: string;
  isVideo: boolean;
  isEnabled: boolean;
}

const Index = () => {
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  
  const visibility = (settings?.section_visibility as SectionVisibility) || {};
  const customSections = (settings?.custom_sections as unknown as CustomSectionData[]) || [];
  const enabledCustomSections = customSections.filter(s => s.isEnabled);
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
      <Floating3DObjects />
      
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
        {isVisible("it-solutions") && <ITSolutions />}
        {isVisible("why-choose-us") && <WhyChooseUs />}
        {/* Consultancy section replaced with accessible CTA block */}
        {isVisible("consultancy") !== false && <CTABlock />}
        {isVisible("contact") && <Contact />}
        
        {/* Custom Sections */}
        {enabledCustomSections.map((section) => (
          <CustomSection
            key={section.id}
            id={section.id}
            name={section.name}
            content={section.content}
            videoUrl={section.videoUrl}
            isVideo={section.isVideo}
          />
        ))}
      </main>
      <Footer />
      <ScrollToTop />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
