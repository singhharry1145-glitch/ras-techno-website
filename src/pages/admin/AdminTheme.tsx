import { useState, useEffect } from "react";
import { Save, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
}

const defaultTheme: ThemeData = {
  primaryColor: "187 100% 50%",
  secondaryColor: "263 70% 50%",
  accentColor: "330 100% 50%",
  gradientStart: "187 100% 50%",
  gradientEnd: "330 100% 50%",
};

const AdminTheme = () => {
  const { data: themeData, isLoading } = useSiteSetting("theme");
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  
  const [theme, setTheme] = useState<ThemeData>(defaultTheme);
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    if (themeData && typeof themeData === "object" && !Array.isArray(themeData)) {
      setTheme({
        primaryColor: (themeData as Record<string, string>).primaryColor || defaultTheme.primaryColor,
        secondaryColor: (themeData as Record<string, string>).secondaryColor || defaultTheme.secondaryColor,
        accentColor: (themeData as Record<string, string>).accentColor || defaultTheme.accentColor,
        gradientStart: (themeData as Record<string, string>).gradientStart || defaultTheme.gradientStart,
        gradientEnd: (themeData as Record<string, string>).gradientEnd || defaultTheme.gradientEnd,
      });
    }
  }, [themeData]);

  useEffect(() => {
    if (previewActive) {
      const root = document.documentElement;
      root.style.setProperty("--primary", theme.primaryColor);
      root.style.setProperty("--secondary", theme.secondaryColor);
      root.style.setProperty("--accent", theme.accentColor);
      root.style.setProperty("--cyan", theme.gradientStart);
      root.style.setProperty("--magenta", theme.gradientEnd);
    }
    
    return () => {
      if (previewActive) {
        // Reset to defaults when leaving preview
        const root = document.documentElement;
        root.style.removeProperty("--primary");
        root.style.removeProperty("--secondary");
        root.style.removeProperty("--accent");
        root.style.removeProperty("--cyan");
        root.style.removeProperty("--magenta");
      }
    };
  }, [theme, previewActive]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: "theme",
        value: theme as unknown as Json,
      });
      toast({
        title: "Theme Saved",
        description: "Your theme settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to defaults.",
    });
  };

  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v));
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 0%";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const colorFields = [
    { key: "primaryColor", label: "Primary Color", description: "Main brand color (buttons, links)" },
    { key: "secondaryColor", label: "Secondary Color", description: "Secondary accent color" },
    { key: "accentColor", label: "Accent Color", description: "Highlight color for emphasis" },
    { key: "gradientStart", label: "Gradient Start", description: "Starting color for gradients" },
    { key: "gradientEnd", label: "Gradient End", description: "Ending color for gradients" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Theme & Colors</h1>
            <p className="text-muted-foreground">Customize the colors and gradients of your website.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={previewActive ? "default" : "outline"}
              onClick={() => setPreviewActive(!previewActive)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewActive ? "Previewing" : "Preview"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={updateSetting.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Color Preview */}
        <div className="p-6 rounded-2xl glass">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Live Preview</h2>
          <div
            className="h-32 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${theme.gradientStart}), hsl(${theme.gradientEnd}))`,
            }}
          >
            <span className="text-2xl font-bold text-white drop-shadow-lg">Gradient Preview</span>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: `hsl(${theme.primaryColor})` }} />
            <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: `hsl(${theme.secondaryColor})` }} />
            <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: `hsl(${theme.accentColor})` }} />
          </div>
        </div>

        {/* Color Settings */}
        <div className="grid gap-6">
          {colorFields.map((field) => (
            <div key={field.key} className="p-6 rounded-2xl glass">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <Label className="text-foreground font-medium">{field.label}</Label>
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={hslToHex(theme[field.key as keyof ThemeData])}
                    onChange={(e) =>
                      setTheme((prev) => ({
                        ...prev,
                        [field.key]: hexToHsl(e.target.value),
                      }))
                    }
                    className="w-16 h-10 rounded-lg cursor-pointer border border-border"
                  />
                  <Input
                    value={theme[field.key as keyof ThemeData]}
                    onChange={(e) =>
                      setTheme((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder="H S% L%"
                    className="w-40 bg-muted/50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTheme;
