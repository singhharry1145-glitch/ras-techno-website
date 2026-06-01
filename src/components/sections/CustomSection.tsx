import { useMemo } from "react";

interface CustomSectionProps {
  id: string;
  name: string;
  content: string;
  videoUrl: string;
  isVideo: boolean;
}

const CustomSection = ({ id, name, content, videoUrl, isVideo }: CustomSectionProps) => {
  // Convert YouTube URL to embed URL
  const embedUrl = useMemo(() => {
    if (!videoUrl) return null;
    
    // YouTube URL patterns
    const youtubeMatch = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL patterns
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Direct video URL
    return videoUrl;
  }, [videoUrl]);

  const isEmbedded = embedUrl?.includes("youtube.com/embed") || embedUrl?.includes("player.vimeo.com");

  return (
    <section id={`custom-${id}`} className="py-16 sm:py-20 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {name}
          </h2>
        </div>

        {/* Content */}
        {isVideo && embedUrl ? (
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden glass">
              {isEmbedded ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                <video
                  src={embedUrl}
                  controls
                  className="w-full aspect-video"
                  poster=""
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-invert max-w-none glass rounded-2xl p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomSection;
