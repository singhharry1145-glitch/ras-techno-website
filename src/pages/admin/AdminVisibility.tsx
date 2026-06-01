import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Plus, Trash2, Video, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SectionVisibility {
  [key: string]: boolean;
}

interface CustomSection {
  id: string;
  name: string;
  content: string;
  videoUrl: string;
  isVideo: boolean;
  isEnabled: boolean;
}

const sectionsList = [
  { key: "hero", label: "Hero Section" },
  { key: "about", label: "About Section" },
  { key: "stats", label: "Statistics Section" },
  { key: "portfolio", label: "Portfolio Section" },
  { key: "services", label: "Services Section" },
  { key: "solutions", label: "Solutions Section" },
  { key: "it-solutions", label: "IT Solutions" },
  { key: "why-choose-us", label: "Why Choose Us" },
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
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    videoUrl: "",
    isVideo: false,
    isEnabled: true,
  });

  useEffect(() => {
    if (settings?.section_visibility) {
      setVisibility(settings.section_visibility as SectionVisibility);
    } else {
      const defaultVisibility: SectionVisibility = {};
      sectionsList.forEach((section) => {
        defaultVisibility[section.key] = true;
      });
      setVisibility(defaultVisibility);
    }

    if (settings?.custom_sections && Array.isArray(settings.custom_sections)) {
      setCustomSections(settings.custom_sections as unknown as CustomSection[]);
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
      await updateSetting.mutateAsync({
        key: "custom_sections",
        value: customSections as unknown as Json,
      });
      toast({
        title: "Settings Saved",
        description: "Section visibility and custom sections have been updated.",
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

  const openAddDialog = () => {
    setEditingSection(null);
    setFormData({
      name: "",
      content: "",
      videoUrl: "",
      isVideo: false,
      isEnabled: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (section: CustomSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      content: section.content,
      videoUrl: section.videoUrl,
      isVideo: section.isVideo,
      isEnabled: section.isEnabled,
    });
    setIsDialogOpen(true);
  };

  const handleSubmitSection = () => {
    if (!formData.name.trim()) {
      toast({ title: "Please enter a section name", variant: "destructive" });
      return;
    }

    if (editingSection) {
      setCustomSections(customSections.map(s => 
        s.id === editingSection.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      const newSection: CustomSection = {
        id: Date.now().toString(),
        ...formData,
      };
      setCustomSections([...customSections, newSection]);
    }

    setIsDialogOpen(false);
    toast({ title: editingSection ? "Section updated" : "Section added", description: "Remember to save changes!" });
  };

  const toggleCustomSection = (id: string) => {
    setCustomSections(customSections.map(s =>
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
    ));
  };

  const deleteCustomSection = (id: string) => {
    if (!confirm("Are you sure you want to delete this custom section?")) return;
    setCustomSections(customSections.filter(s => s.id !== id));
    toast({ title: "Section deleted", description: "Remember to save changes!" });
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
          <h3 className="font-semibold text-foreground mb-2">Default Sections</h3>
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

        {/* Custom Sections */}
        <div className="rounded-2xl glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Custom Sections</h3>
              <p className="text-sm text-muted-foreground">Add custom sections with video or content</p>
            </div>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>

          {customSections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No custom sections yet. Add one to display video or custom content.
            </p>
          ) : (
            <div className="space-y-3">
              {customSections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border ${
                    !section.isEnabled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.isVideo ? (
                      <Youtube className="w-5 h-5 text-red-500" />
                    ) : (
                      <Video className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{section.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.isVideo ? "Video/YouTube" : "Content Section"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.isEnabled}
                      onCheckedChange={() => toggleCustomSection(section.id)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(section)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteCustomSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Add/Edit Custom Section Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Custom Section" : "Add Custom Section"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Section Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Featured Video, Promo Section"
                className="bg-muted/50 mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isVideo}
                onCheckedChange={(checked) => setFormData({ ...formData, isVideo: checked })}
              />
              <Label>This section contains a video</Label>
            </div>

            {formData.isVideo ? (
              <div>
                <Label>Video URL (YouTube or direct video URL)</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                  className="bg-muted/50 mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports YouTube, Vimeo, and direct video URLs
                </p>
              </div>
            ) : (
              <div>
                <Label>Content (HTML or text)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your section content here..."
                  className="bg-muted/50 mt-1"
                  rows={5}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
              <Label>Enable this section</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleSubmitSection}>
                {editingSection ? "Update Section" : "Add Section"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVisibility;
