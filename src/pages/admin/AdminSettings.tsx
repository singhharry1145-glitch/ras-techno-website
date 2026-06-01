import { useState, useEffect, useCallback } from "react";
import { Lock, Mail, User, Upload, Image, AlertTriangle, Facebook, Linkedin, Twitter, Instagram, Globe, Plus, X, Link as LinkIcon, Calendar, Check, Loader2, Trash2, Save, MessageCircle, Phone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Json } from "@/integrations/supabase/types";

interface ImagePreview {
  file: File;
  preview: string;
  compressed?: Blob;
}

interface SocialLinks {
  facebook: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
}

interface CustomLink {
  id: string;
  name: string;
  url: string;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  
  // Password reset state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Image upload state with saved status and previews
  const [imageStates, setImageStates] = useState<Record<string, { uploading: boolean; saved: boolean; saving: boolean }>>({
    logo: { uploading: false, saved: false, saving: false },
    hero: { uploading: false, saved: false, saving: false },
    og_image: { uploading: false, saved: false, saving: false },
    favicon: { uploading: false, saved: false, saving: false },
  });
  
  // Local image previews before saving
  const [imagePreviews, setImagePreviews] = useState<Record<string, ImagePreview | null>>({
    logo: null,
    hero: null,
    og_image: null,
    favicon: null,
  });
  
  // Bulk delete state
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Compress image function
  const compressImage = useCallback(async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          file.type.includes('png') ? 'image/png' : 'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);
  
  // Handle file selection (shows preview, compresses image)
  const handleFileSelect = useCallback(async (file: File, type: "logo" | "hero" | "og_image" | "favicon") => {
    const preview = URL.createObjectURL(file);
    
    try {
      // Compress the image
      const maxWidth = type === 'favicon' ? 128 : type === 'logo' ? 512 : 1920;
      const quality = type === 'favicon' ? 1 : 0.85;
      const compressed = await compressImage(file, maxWidth, quality);
      
      setImagePreviews(prev => ({
        ...prev,
        [type]: { file, preview, compressed }
      }));
      
      const originalSize = (file.size / 1024).toFixed(1);
      const compressedSize = (compressed.size / 1024).toFixed(1);
      
      toast({ 
        title: "Image ready to save",
        description: `Compressed: ${originalSize}KB → ${compressedSize}KB`
      });
    } catch (error) {
      // If compression fails, use original
      setImagePreviews(prev => ({
        ...prev,
        [type]: { file, preview }
      }));
    }
  }, [compressImage, toast]);
  
  // Save single image
  const handleSaveImage = async (type: "logo" | "hero" | "og_image" | "favicon") => {
    const imagePreview = imagePreviews[type];
    if (!imagePreview) return;
    
    setImageStates(prev => ({ ...prev, [type]: { ...prev[type], saving: true } }));

    try {
      const fileExt = imagePreview.file.name.split(".").pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;
      
      // Use compressed version if available
      const uploadData = imagePreview.compressed || imagePreview.file;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, uploadData);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      // Save to site settings
      const imagesSettings = (settings?.images as Record<string, string>) || {};
      await updateSetting.mutateAsync({
        key: "images",
        value: { ...imagesSettings, [type]: publicUrl } as Json,
      });

      const typeLabel = 
        type === "logo" ? "Logo" : 
        type === "hero" ? "Hero image" : 
        type === "og_image" ? "Google/OG image" :
        "Favicon";
      toast({ title: `${typeLabel} saved successfully!` });
      
      // Clear the preview
      setImagePreviews(prev => ({ ...prev, [type]: null }));
      setImageStates(prev => ({ ...prev, [type]: { uploading: false, saved: true, saving: false } }));
      
      // Reset saved status after 3 seconds
      setTimeout(() => {
        setImageStates(prev => ({ ...prev, [type]: { uploading: false, saved: false, saving: false } }));
      }, 3000);
    } catch (error: any) {
      toast({ title: error.message || "Failed to save image", variant: "destructive" });
      setImageStates(prev => ({ ...prev, [type]: { uploading: false, saved: false, saving: false } }));
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedForDelete.length === 0) return;
    
    setIsDeleting(true);
    try {
      const imagesSettings = (settings?.images as Record<string, string>) || {};
      const updatedImages = { ...imagesSettings };
      
      // Remove selected images from settings
      for (const type of selectedForDelete) {
        delete updatedImages[type];
      }
      
      await updateSetting.mutateAsync({
        key: "images",
        value: updatedImages as Json,
      });
      
      toast({ title: `${selectedForDelete.length} image(s) removed successfully` });
      setSelectedForDelete([]);
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete images", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Toggle selection for delete
  const toggleDeleteSelection = (type: string) => {
    setSelectedForDelete(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    website: "",
  });
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  
  // Appointment URL state
  const [appointmentUrl, setAppointmentUrl] = useState("");
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  
  // WhatsApp settings state
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("918076254477");
  const [whatsappMessage, setWhatsappMessage] = useState("Hi, I'd like to know more about your IT services.");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  // IT Solutions scroller state
  const [scrollerEnabled, setScrollerEnabled] = useState(true);
  const [isSavingScroller, setIsSavingScroller] = useState(false);

  // Load social links from settings
  useEffect(() => {
    if (settings?.social_links) {
      const links = settings.social_links as Record<string, unknown>;
      setSocialLinks({
        facebook: (links.facebook as string) || "",
        linkedin: (links.linkedin as string) || "",
        twitter: (links.twitter as string) || "",
        instagram: (links.instagram as string) || "",
        website: (links.website as string) || "",
      });
      
      // Load custom links
      if (links.custom && Array.isArray(links.custom)) {
        setCustomLinks(links.custom as CustomLink[]);
      }
    }
  }, [settings?.social_links]);
  
  // Load appointment URL from consultancy settings
  useEffect(() => {
    if (settings?.consultancy) {
      const consultancy = settings.consultancy as Record<string, string>;
      setAppointmentUrl(consultancy.appointmentUrl || "");
    }
  }, [settings?.consultancy]);
  
  // Load WhatsApp settings
  useEffect(() => {
    if (settings?.whatsapp) {
      const wa = settings.whatsapp as Record<string, unknown>;
      setWhatsappEnabled(wa.enabled !== false);
      setWhatsappNumber((wa.number as string) || "918076254477");
      setWhatsappMessage((wa.message as string) || "Hi, I'd like to know more about your IT services.");
    }
  }, [settings?.whatsapp]);

  // Load IT Solutions scroller settings
  useEffect(() => {
    if (settings?.it_solutions_scroller) {
      const sc = settings.it_solutions_scroller as Record<string, unknown>;
      setScrollerEnabled(sc.enabled !== false);
    }
  }, [settings?.it_solutions_scroller]);

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({ title: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: error.message || "Failed to update password", variant: "destructive" });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Legacy direct upload (keeping for compatibility but now unused)
  const handleImageUpload = async (file: File, type: "logo" | "hero" | "og_image" | "favicon") => {
    // Now uses the new flow: handleFileSelect -> handleSaveImage
    handleFileSelect(file, type);
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) throw error;

      toast({ title: "Password reset email sent", description: "Check your inbox for the reset link" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to send reset email", variant: "destructive" });
    }
  };

  const handleSaveSocialLinks = async () => {
    setIsSavingSocial(true);
    try {
      const socialData = {
        ...socialLinks,
        custom: customLinks,
      };
      
      // First check if the setting exists
      const { data: existingSetting } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "social_links")
        .maybeSingle();

      if (existingSetting) {
        // Update existing
        await updateSetting.mutateAsync({
          key: "social_links",
          value: socialData as unknown as Json,
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "social_links", value: socialData as unknown as Json });
        if (error) throw error;
      }

      toast({ title: "Social links saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save social links", variant: "destructive" });
    } finally {
      setIsSavingSocial(false);
    }
  };
  
  const handleSaveAppointmentUrl = async () => {
    setIsSavingAppointment(true);
    try {
      const consultancySettings = (settings?.consultancy as Record<string, string>) || {};
      
      // First check if the setting exists
      const { data: existingSetting } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "consultancy")
        .maybeSingle();

      const newConsultancy = {
        ...consultancySettings,
        appointmentUrl: appointmentUrl,
      };

      if (existingSetting) {
        await updateSetting.mutateAsync({
          key: "consultancy",
          value: newConsultancy as unknown as Json,
        });
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "consultancy", value: newConsultancy as unknown as Json });
        if (error) throw error;
      }

      toast({ title: "Appointment URL saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save appointment URL", variant: "destructive" });
    } finally {
      setIsSavingAppointment(false);
    }
  };
  
  const handleSaveWhatsapp = async () => {
    setIsSavingWhatsapp(true);
    try {
      const whatsappData = {
        enabled: whatsappEnabled,
        number: whatsappNumber,
        message: whatsappMessage,
      };

      const { data: existingSetting } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "whatsapp")
        .maybeSingle();

      if (existingSetting) {
        await updateSetting.mutateAsync({
          key: "whatsapp",
          value: whatsappData as unknown as Json,
        });
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "whatsapp", value: whatsappData as unknown as Json });
        if (error) throw error;
      }

      toast({ title: "WhatsApp settings saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save WhatsApp settings", variant: "destructive" });
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const handleSaveScroller = async () => {
    setIsSavingScroller(true);
    try {
      const scrollerData = { enabled: scrollerEnabled };
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "it_solutions_scroller")
        .maybeSingle();

      if (existing) {
        await supabase.from("site_settings").update({ value: scrollerData as unknown as Json }).eq("key", "it_solutions_scroller");
      } else {
        await supabase.from("site_settings").insert({ key: "it_solutions_scroller", value: scrollerData as unknown as Json });
      }
      toast({ title: "IT Solutions scroller settings saved" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save scroller settings", variant: "destructive" });
    } finally {
      setIsSavingScroller(false);
    }
  };

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      name: "",
      url: "",
    };
    setCustomLinks([...customLinks, newLink]);
  };
  
  const updateCustomLink = (id: string, field: "name" | "url", value: string) => {
    setCustomLinks(customLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };
  
  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and site settings.</p>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email Address</Label>
              <p className="text-foreground font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="text-foreground font-mono text-sm">{user?.id}</p>
            </div>
          </div>
        </div>
        
        {/* Appointment Settings */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Appointment Settings
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Book Appointment URL</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter the URL where users will be redirected when clicking "Book Appointment" button (e.g., Calendly, Cal.com, etc.)
              </p>
              <Input
                type="url"
                value={appointmentUrl}
                onChange={(e) => setAppointmentUrl(e.target.value)}
                placeholder="https://calendly.com/your-link"
                className="bg-muted/50"
              />
            </div>
            <Button
              variant="gradient"
              onClick={handleSaveAppointmentUrl}
              disabled={isSavingAppointment}
            >
              {isSavingAppointment ? "Saving..." : "Save Appointment URL"}
            </Button>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            WhatsApp Floating Button
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label>Enable WhatsApp floating button</Label>
            </div>
            <div>
              <Label className="mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp Phone Number
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter with country code, no spaces or + sign (e.g., 918076254477)
              </p>
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="918076254477"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="mb-2 block">Pre-filled Message</Label>
              <Input
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="Hi, I'd like to know more about your services."
                className="bg-muted/50"
              />
            </div>
            <Button
              variant="gradient"
              onClick={handleSaveWhatsapp}
              disabled={isSavingWhatsapp}
            >
              {isSavingWhatsapp ? "Saving..." : "Save WhatsApp Settings"}
            </Button>
          </div>
        </div>

        {/* IT Solutions Scroller Settings */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            IT Solutions Auto-Scroll
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={scrollerEnabled}
                onChange={(e) => setScrollerEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label>Enable auto-scrolling for IT Solutions section</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, the IT Solutions cards will automatically scroll horizontally. Users can still scroll manually.
            </p>
            <Button
              variant="gradient"
              onClick={handleSaveScroller}
              disabled={isSavingScroller}
            >
              {isSavingScroller ? "Saving..." : "Save Scroller Settings"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Social Media Links
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Label>
              <Input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/yourcompany"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Twitter className="w-4 h-4 text-sky-500" />
                Twitter / X
              </Label>
              <Input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
              </Label>
              <Input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                Website
              </Label>
              <Input
                type="url"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="bg-muted/50"
              />
            </div>
            
            {/* Custom Links Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  Custom Links
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomLink}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Custom Link
                </Button>
              </div>
              
              {customLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add custom social media or platform links (YouTube, TikTok, Discord, etc.)
                </p>
              ) : (
                <div className="space-y-3">
                  {customLinks.map((link) => (
                    <div key={link.id} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Platform Name (e.g., YouTube)"
                          value={link.name}
                          onChange={(e) => updateCustomLink(link.id, "name", e.target.value)}
                          className="bg-muted/50"
                        />
                        <Input
                          type="url"
                          placeholder="URL (e.g., https://youtube.com/@yourchannel)"
                          value={link.url}
                          onChange={(e) => updateCustomLink(link.id, "url", e.target.value)}
                          className="bg-muted/50"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomLink(link.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="gradient"
              onClick={handleSaveSocialLinks}
              disabled={isSavingSocial}
              className="mt-4"
            >
              {isSavingSocial ? "Saving..." : "Save Social Links"}
            </Button>
          </div>
        </div>

        {/* Password Reset */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-muted/50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="gradient"
                onClick={handlePasswordReset}
                disabled={isResettingPassword || !newPassword || !confirmPassword}
              >
                {isResettingPassword ? "Updating..." : "Update Password"}
              </Button>
              <Button variant="outline" onClick={handleForgotPassword}>
                <Mail className="w-4 h-4 mr-2" />
                Send Reset Email
              </Button>
            </div>
          </div>
        </div>

        {/* Image Management */}
        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Site Images
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Upload images and see a preview before saving. Images are compressed automatically for faster loading.
          </p>
          
          {/* Bulk Delete Actions */}
          {selectedForDelete.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between">
              <span className="text-sm text-destructive">
                {selectedForDelete.length} image(s) selected for deletion
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedForDelete([])}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Company Logo</Label>
                {(settings?.images as Record<string, string>)?.logo && (
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedForDelete.includes('logo')}
                      onCheckedChange={() => toggleDeleteSelection('logo')}
                    />
                    <span className="text-xs text-muted-foreground">Select to delete</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Current Image */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  {(settings?.images as Record<string, string>)?.logo ? (
                    <img
                      src={(settings?.images as Record<string, string>)?.logo}
                      alt="Current logo"
                      className="w-16 h-16 object-contain rounded-lg bg-muted border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                {/* Preview (if file selected) */}
                {imagePreviews.logo && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center">
                      <p className="text-xs text-primary mb-1">New Preview</p>
                      <img
                        src={imagePreviews.logo.preview}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded-lg bg-muted border-2 border-primary"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "logo");
                    }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <label htmlFor="logo-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </span>
                      </Button>
                    </label>
                    
                    {imagePreviews.logo && (
                      <Button 
                        variant="gradient" 
                        onClick={() => handleSaveImage("logo")}
                        disabled={imageStates.logo.saving}
                      >
                        {imageStates.logo.saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {imageStates.logo.saving ? "Saving..." : "Save Logo"}
                      </Button>
                    )}
                    
                    {imageStates.logo.saved && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Any image format • Auto-compressed</p>
                </div>
              </div>
            </div>

            {/* Hero Image Upload */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Hero Background Image</Label>
                {(settings?.images as Record<string, string>)?.hero && (
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedForDelete.includes('hero')}
                      onCheckedChange={() => toggleDeleteSelection('hero')}
                    />
                    <span className="text-xs text-muted-foreground">Select to delete</span>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-4">
                {/* Current Image */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  {(settings?.images as Record<string, string>)?.hero ? (
                    <img
                      src={(settings?.images as Record<string, string>)?.hero}
                      alt="Current hero"
                      className="w-32 h-20 object-cover rounded-lg bg-muted border border-border"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                {/* Preview */}
                {imagePreviews.hero && (
                  <>
                    <span className="text-muted-foreground mt-8">→</span>
                    <div className="text-center">
                      <p className="text-xs text-primary mb-1">New Preview</p>
                      <img
                        src={imagePreviews.hero.preview}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-lg bg-muted border-2 border-primary"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="hero-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "hero");
                    }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <label htmlFor="hero-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </span>
                      </Button>
                    </label>
                    
                    {imagePreviews.hero && (
                      <Button 
                        variant="gradient" 
                        onClick={() => handleSaveImage("hero")}
                        disabled={imageStates.hero.saving}
                      >
                        {imageStates.hero.saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {imageStates.hero.saving ? "Saving..." : "Save Hero"}
                      </Button>
                    )}
                    
                    {imageStates.hero.saved && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Any image format • Auto-compressed</p>
                </div>
              </div>
            </div>
            
            {/* OG/Google Image Upload */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Google/Social Preview Image (OG Image)</Label>
                {(settings?.images as Record<string, string>)?.og_image && (
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedForDelete.includes('og_image')}
                      onCheckedChange={() => toggleDeleteSelection('og_image')}
                    />
                    <span className="text-xs text-muted-foreground">Select to delete</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                This image appears when your site is shared on Google, Facebook, Twitter, LinkedIn, etc.
              </p>
              <div className="flex items-start gap-4">
                {/* Current Image */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  {(settings?.images as Record<string, string>)?.og_image ? (
                    <img
                      src={(settings?.images as Record<string, string>)?.og_image}
                      alt="Current OG image"
                      className="w-32 h-20 object-cover rounded-lg bg-muted border border-border"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                {/* Preview */}
                {imagePreviews.og_image && (
                  <>
                    <span className="text-muted-foreground mt-8">→</span>
                    <div className="text-center">
                      <p className="text-xs text-primary mb-1">New Preview</p>
                      <img
                        src={imagePreviews.og_image.preview}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-lg bg-muted border-2 border-primary"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="og-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "og_image");
                    }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <label htmlFor="og-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </span>
                      </Button>
                    </label>
                    
                    {imagePreviews.og_image && (
                      <Button 
                        variant="gradient" 
                        onClick={() => handleSaveImage("og_image")}
                        disabled={imageStates.og_image.saving}
                      >
                        {imageStates.og_image.saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {imageStates.og_image.saving ? "Saving..." : "Save OG Image"}
                      </Button>
                    )}
                    
                    {imageStates.og_image.saved && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Any image format • Auto-compressed</p>
                </div>
              </div>
            </div>
            
            {/* Favicon Upload */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">Favicon (Browser Tab & Google Search Icon)</Label>
                {(settings?.images as Record<string, string>)?.favicon && (
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedForDelete.includes('favicon')}
                      onCheckedChange={() => toggleDeleteSelection('favicon')}
                    />
                    <span className="text-xs text-muted-foreground">Select to delete</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                This icon appears in browser tabs, bookmarks, and next to your site in Google search results.
              </p>
              <div className="flex items-center gap-4">
                {/* Current Image */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  {(settings?.images as Record<string, string>)?.favicon ? (
                    <img
                      src={(settings?.images as Record<string, string>)?.favicon}
                      alt="Current favicon"
                      className="w-12 h-12 object-contain rounded-lg bg-muted border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border">
                      <Image className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                {/* Preview */}
                {imagePreviews.favicon && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center">
                      <p className="text-xs text-primary mb-1">New Preview</p>
                      <img
                        src={imagePreviews.favicon.preview}
                        alt="Preview"
                        className="w-12 h-12 object-contain rounded-lg bg-muted border-2 border-primary"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="favicon-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, "favicon");
                    }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <label htmlFor="favicon-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </span>
                      </Button>
                    </label>
                    
                    {imagePreviews.favicon && (
                      <Button 
                        variant="gradient" 
                        onClick={() => handleSaveImage("favicon")}
                        disabled={imageStates.favicon.saving}
                      >
                        {imageStates.favicon.saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {imageStates.favicon.saving ? "Saving..." : "Save Favicon"}
                      </Button>
                    )}
                    
                    {imageStates.favicon.saved && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-4 h-4" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Any image format • Auto-optimized for icons</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <Check className="w-4 h-4 text-green-500" />
              <span>Images are automatically compressed before upload for faster page loads</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-destructive/30 p-6 bg-destructive/5">
          <h2 className="font-display text-xl font-semibold text-destructive mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-muted-foreground mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
            Clear All Site Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
