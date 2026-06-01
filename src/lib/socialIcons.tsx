import { 
  Facebook, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Globe, 
  ExternalLink,
  Youtube,
  MessageCircle,
  Send,
  Music2,
  Gamepad2,
  Camera,
  Video,
  Rss,
  Mail,
  Phone,
  MapPin,
  Link2
} from "lucide-react";

// Map of platform names/keywords to their icons and hover colors
const socialIconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  // Standard platforms
  facebook: { icon: Facebook, color: "hover:text-blue-500" },
  linkedin: { icon: Linkedin, color: "hover:text-blue-600" },
  twitter: { icon: Twitter, color: "hover:text-sky-400" },
  x: { icon: Twitter, color: "hover:text-foreground" },
  instagram: { icon: Instagram, color: "hover:text-pink-500" },
  youtube: { icon: Youtube, color: "hover:text-red-500" },
  tiktok: { icon: Music2, color: "hover:text-foreground" },
  discord: { icon: Gamepad2, color: "hover:text-indigo-500" },
  whatsapp: { icon: MessageCircle, color: "hover:text-green-500" },
  telegram: { icon: Send, color: "hover:text-blue-400" },
  snapchat: { icon: Camera, color: "hover:text-yellow-400" },
  pinterest: { icon: Camera, color: "hover:text-red-600" },
  tumblr: { icon: Rss, color: "hover:text-blue-800" },
  reddit: { icon: MessageCircle, color: "hover:text-orange-500" },
  twitch: { icon: Video, color: "hover:text-purple-500" },
  vimeo: { icon: Video, color: "hover:text-blue-500" },
  github: { icon: Globe, color: "hover:text-foreground" },
  dribbble: { icon: Camera, color: "hover:text-pink-400" },
  behance: { icon: Camera, color: "hover:text-blue-600" },
  medium: { icon: Rss, color: "hover:text-foreground" },
  // Generic
  website: { icon: Globe, color: "hover:text-primary" },
  email: { icon: Mail, color: "hover:text-primary" },
  phone: { icon: Phone, color: "hover:text-primary" },
  location: { icon: MapPin, color: "hover:text-primary" },
  link: { icon: Link2, color: "hover:text-primary" },
};

export const getSocialIcon = (platformName: string, url?: string): { icon: React.ComponentType<{ className?: string }>; color: string } => {
  const lowerName = platformName.toLowerCase().trim();
  
  // First try exact match
  if (socialIconMap[lowerName]) {
    return socialIconMap[lowerName];
  }
  
  // Try to detect from URL if provided
  if (url) {
    const lowerUrl = url.toLowerCase();
    for (const [key, value] of Object.entries(socialIconMap)) {
      if (lowerUrl.includes(key)) {
        return value;
      }
    }
  }
  
  // Try to detect from name containing a keyword
  for (const [key, value] of Object.entries(socialIconMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Default fallback
  return { icon: ExternalLink, color: "hover:text-primary" };
};

export default socialIconMap;
