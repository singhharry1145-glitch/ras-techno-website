import { useState, useEffect } from "react";
import { Lock, Mail, User, Upload, Image, AlertTriangle, Facebook, Linkedin, Twitter, Instagram, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Json } from "@/integrations/supabase/types";

interface SocialLinks {
  facebook: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
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
  
  // Image upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    website: "",
  });
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  // Load social links from settings
  useEffect(() => {
    if (settings?.social_links) {
      const links = settings.social_links as Record<string, string>;
      setSocialLinks({
        facebook: links.facebook || "",
        linkedin: links.linkedin || "",
        twitter: links.twitter || "",
        instagram: links.instagram || "",
        website: links.website || "",
      });
    }
  }, [settings?.social_links]);

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

  const handleImageUpload = async (file: File, type: "logo" | "hero") => {
    const setUploading = type === "logo" ? setIsUploadingLogo : setIsUploadingHero;
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

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

      toast({ title: `${type === "logo" ? "Logo" : "Hero image"} updated successfully` });
    } catch (error: any) {
      toast({ title: error.message || "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
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
          value: socialLinks as unknown as Json,
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "social_links", value: socialLinks as unknown as Json });
        if (error) throw error;
      }

      toast({ title: "Social links saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save social links", variant: "destructive" });
    } finally {
      setIsSavingSocial(false);
    }
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

        {/* Social Media Links */}
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
            <Button
              variant="gradient"
              onClick={handleSaveSocialLinks}
              disabled={isSavingSocial}
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
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <Label className="mb-2 block">Company Logo</Label>
              <div className="flex items-center gap-4">
                {(settings?.images as Record<string, string>)?.logo && (
                  <img
                    src={(settings?.images as Record<string, string>)?.logo}
                    alt="Current logo"
                    className="w-16 h-16 object-contain rounded-lg bg-muted"
                  />
                )}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "logo");
                    }}
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outline" asChild disabled={isUploadingLogo}>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 200x200px PNG with transparent background</p>
                </div>
              </div>
            </div>

            {/* Hero Image Upload */}
            <div>
              <Label className="mb-2 block">Hero Background Image</Label>
              <div className="flex items-start gap-4">
                {(settings?.images as Record<string, string>)?.hero && (
                  <img
                    src={(settings?.images as Record<string, string>)?.hero}
                    alt="Current hero"
                    className="w-32 h-20 object-cover rounded-lg bg-muted"
                  />
                )}
                <div>
                  <input
                    type="file"
                    id="hero-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "hero");
                    }}
                  />
                  <label htmlFor="hero-upload">
                    <Button variant="outline" asChild disabled={isUploadingHero}>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingHero ? "Uploading..." : "Upload Hero Image"}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1920x1080px JPG or PNG</p>
                </div>
              </div>
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