import { useState, useEffect } from "react";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface SectionData {
  [key: string]: string;
}

const sections = [
  {
    key: "hero",
    label: "Hero Section",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "ctaText", label: "Primary Button Text", type: "text" },
      { name: "ctaSecondary", label: "Secondary Button Text", type: "text" },
    ],
  },
  {
    key: "services",
    label: "Services Section",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    key: "about",
    label: "About Section",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "content", label: "Content", type: "textarea" },
    ],
  },
  {
    key: "stats",
    label: "Statistics Section",
    fields: [
      { name: "sectionTitle", label: "Section Title", type: "text" },
      { name: "sectionSubtitle", label: "Section Subtitle", type: "text" },
      { name: "projectsDelivered", label: "Projects Delivered (number)", type: "text" },
      { name: "projectsLabel", label: "Projects Label", type: "text" },
      { name: "happyClients", label: "Happy Clients (number)", type: "text" },
      { name: "clientsLabel", label: "Clients Label", type: "text" },
      { name: "itSolutions", label: "IT Solutions (number)", type: "text" },
      { name: "solutionsLabel", label: "Solutions Label", type: "text" },
      { name: "successRate", label: "Success Rate (number)", type: "text" },
      { name: "successLabel", label: "Success Rate Label", type: "text" },
    ],
  },
  {
    key: "contact",
    label: "Contact Section",
    fields: [
      { name: "email", label: "Email Address", type: "text" },
      { name: "phone", label: "Phone Number", type: "text" },
      { name: "address", label: "Address", type: "text" },
      { name: "benefit1", label: "Benefit 1", type: "text" },
      { name: "benefit2", label: "Benefit 2", type: "text" },
      { name: "benefit3", label: "Benefit 3", type: "text" },
      { name: "benefit4", label: "Benefit 4", type: "text" },
    ],
  },
  {
    key: "consultancy",
    label: "Consultancy Section",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "appointmentUrl", label: "Appointment Booking URL", type: "text" },
      { name: "cardTitle", label: "Card Title", type: "text" },
      { name: "cardSubtitle", label: "Card Subtitle", type: "text" },
      { name: "sessionDuration", label: "Session Duration (e.g., 30+ Minutes)", type: "text" },
      { name: "availableDays", label: "Available Days (e.g., Monday to Friday)", type: "text" },
      { name: "availableTime", label: "Available Time (e.g., 9 AM - 6 PM)", type: "text" },
      { name: "feature1Title", label: "Feature 1 Title", type: "text" },
      { name: "feature1Desc", label: "Feature 1 Description", type: "text" },
      { name: "feature2Title", label: "Feature 2 Title", type: "text" },
      { name: "feature2Desc", label: "Feature 2 Description", type: "text" },
      { name: "feature3Title", label: "Feature 3 Title", type: "text" },
      { name: "feature3Desc", label: "Feature 3 Description", type: "text" },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { name: "copyright", label: "Copyright Text", type: "text" },
    ],
  },
];

const AdminSections = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  
  const [sectionData, setSectionData] = useState<Record<string, SectionData>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(["hero"]);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      const data: Record<string, SectionData> = {};
      sections.forEach((section) => {
        const settingValue = settings[section.key];
        if (settingValue && typeof settingValue === "object" && !Array.isArray(settingValue)) {
          data[section.key] = settingValue as SectionData;
        } else {
          data[section.key] = {};
        }
      });
      setSectionData(data);
    }
  }, [settings]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleChange = (sectionKey: string, fieldName: string, value: string) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldName]: value,
      },
    }));
  };

  const handleSave = async (sectionKey: string) => {
    setSavingSection(sectionKey);
    try {
      await updateSetting.mutateAsync({
        key: sectionKey,
        value: sectionData[sectionKey] as unknown as Json,
      });
      toast({
        title: "Section Saved",
        description: `${sections.find((s) => s.key === sectionKey)?.label} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section.",
        variant: "destructive",
      });
    } finally {
      setSavingSection(null);
    }
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
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Section Content</h1>
          <p className="text-muted-foreground">Edit the text content of each section on your website.</p>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.key);
          const isSaving = savingSection === section.key;
          
          return (
            <div key={section.key} className="rounded-2xl glass overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <h2 className="font-display text-lg font-semibold text-foreground">{section.label}</h2>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Section content */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 space-y-4 border-t border-border pt-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-foreground font-medium mb-2 block">{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={sectionData[section.key]?.[field.name] || ""}
                          onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                          className="bg-muted/50"
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={sectionData[section.key]?.[field.name] || ""}
                          onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                          className="bg-muted/50"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    variant="gradient"
                    onClick={() => handleSave(section.key)}
                    disabled={isSaving}
                    className="mt-4"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Section"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminSections;
