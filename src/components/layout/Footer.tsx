import { useState, forwardRef } from "react";
import { Send, Facebook, Linkedin, Twitter, Instagram, Globe } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Work", href: "#work" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ],
  services: [
    { name: "Animation & Design", href: "#services" },
    { name: "Software Development", href: "#services" },
    { name: "AI & Automation", href: "#services" },
    { name: "IT Consultancy", href: "#services" },
  ],
  resources: [
    { name: "Blog", href: "#blog" },
    { name: "Case Studies", href: "#work" },
    { name: "Documentation", href: "#" },
    { name: "Support", href: "#contact" },
  ],
};

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const { data: socialLinks } = useSiteSetting("social_links");
  const navigate = useNavigate();
  const location = useLocation();

  const links = (socialLinks as Record<string, string>) || {};

  const socialIcons = [
    { name: "Facebook", icon: Facebook, url: links.facebook, color: "hover:text-blue-500" },
    { name: "LinkedIn", icon: Linkedin, url: links.linkedin, color: "hover:text-blue-600" },
    { name: "Twitter", icon: Twitter, url: links.twitter, color: "hover:text-sky-400" },
    { name: "Instagram", icon: Instagram, url: links.instagram, color: "hover:text-pink-500" },
    { name: "Website", icon: Globe, url: links.website, color: "hover:text-primary" },
  ].filter(item => item.url);

  const scrollTo = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      const id = href.replace('#', '');
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast({
      title: "Subscribed!",
      description: "Thanks for subscribing to our newsletter.",
    });
    setEmail("");
  };

  return (
    <footer ref={ref} className="py-12 sm:py-16 border-t border-border relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-4">
              <img 
                src="/ras-logo.png" 
                alt="RaS Techno" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
              />
              <span className="font-display font-bold text-lg sm:text-xl text-gradient-primary">
                RaS Techno
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm sm:text-base">
              Animating Ideas. Engineering Solutions. Your partner in blending artistry with technology.
            </p>

            {/* Social Media Icons */}
            {socialIcons.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-foreground mb-3 text-sm sm:text-base">Follow Us</p>
                <div className="flex gap-3">
                  {socialIcons.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground transition-all duration-200 ${social.color} hover:bg-muted`}
                      title={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div>
              <p className="font-semibold text-foreground mb-3 text-sm sm:text-base">Stay Updated</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 flex-1"
                />
                <Button type="submit" variant="gradient" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => scrollTo(link.href)} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => scrollTo(link.href)} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button 
                    onClick={() => scrollTo(link.href)} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © 2025 RaS Techno. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
