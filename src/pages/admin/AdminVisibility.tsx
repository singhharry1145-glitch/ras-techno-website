import { useState, useEffect } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface SectionVisibility {
  [key: string]: boolean;
}

const sectionsList = [
  { key: "hero", label: "Hero Section" },
  { key: "about", label: "About Section" },
  { key: "stats", label: "Statistics Section" },
  { key: "portfolio", label: "Portfolio Section" },
  { key: "services", label: "Services Section" },
  { key: "solutions", label: "Solutions Section" },
  { key: "clients", label: "Clients Section" },
  { key: "blog", label: "Blog Section" },
  { key: "journey", label: "Journey Section" },
  { key: "awards", label: "Awards & Certificates" },
  { key: "consultancy", label: "Consultancy Section" },
  { key: "contact", label: "Contact Section" },
];

const AdminVisibility = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();

  const [visibility, setVisibility] = useState<SectionVisibility>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.section_visibility) {
      setVisibility(settings.section_visibility as SectionVisibility);
    } else {
      // Default all sections to visible
      const defaultVisibility: SectionVisibility = {};
      sectionsList.forEach((section) => {
        defaultVisibility[section.key] = true;
      });
      setVisibility(defaultVisibility);
    }
  }, [settings]);

  const handleToggle = (key: string) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({
        key: "section_visibility",
        value: visibility as unknown as Json,
      });
      toast({
        title: "Settings Saved",
        description: "Section visibility has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save visibility settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAll = (visible: boolean) => {
    const newVisibility: SectionVisibility = {};
    sectionsList.forEach((section) => {
      newVisibility[section.key] = visible;
    });
    setVisibility(newVisibility);
  };

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
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Section Visibility</h1>
          <p className="text-muted-foreground">
            Control which sections are visible on your website. Toggle off to hide sections.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleToggleAll(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Show All
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleToggleAll(false)}>
            <EyeOff className="w-4 h-4 mr-2" />
            Hide All
          </Button>
        </div>

        {/* Sections List */}
        <div className="rounded-2xl glass p-6 space-y-4">
          {sectionsList.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                {visibility[section.key] !== false ? (
                  <Eye className="w-5 h-5 text-primary" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                <Label className="text-foreground font-medium cursor-pointer">
                  {section.label}
                </Label>
              </div>
              <Switch
                checked={visibility[section.key] !== false}
                onCheckedChange={() => handleToggle(section.key)}
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminVisibility;
