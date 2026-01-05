import { useState, useEffect } from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface PolicyContent {
  title: string;
  lastUpdated: string;
  content: string;
}

const defaultPolicies = {
  privacy_policy: {
    title: "Privacy Policy",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `## Information We Collect

We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us.

## How We Use Your Information

We use the information we collect to provide, maintain, and improve our services, and to communicate with you.

## Information Sharing

We do not share your personal information with third parties except as described in this policy or with your consent.

## Security

We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.

## Contact Us

If you have any questions about this Privacy Policy, please contact us.`,
  },
  terms_conditions: {
    title: "Terms & Conditions",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.

## Use License

Permission is granted to temporarily download one copy of the materials on RaS Techno's website for personal, non-commercial transitory viewing only.

## Disclaimer

The materials on RaS Techno's website are provided on an 'as is' basis. RaS Techno makes no warranties, expressed or implied.

## Limitations

In no event shall RaS Techno be liable for any damages arising out of the use or inability to use the materials on this website.

## Contact Information

If you have any questions about these Terms & Conditions, please contact us.`,
  },
  cookie_policy: {
    title: "Cookie Policy",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: `## What Are Cookies

Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently.

## How We Use Cookies

We use cookies to understand how you use our website and to improve your experience. This includes personalizing content and remembering your preferences.

## Types of Cookies We Use

- Essential Cookies: Required for the website to function properly
- Analytics Cookies: Help us understand how visitors interact with our website
- Preference Cookies: Remember your settings and preferences

## Managing Cookies

You can control and manage cookies through your browser settings. Please note that removing or blocking cookies may impact your user experience.

## Contact Us

If you have any questions about our Cookie Policy, please contact us.`,
  },
};

const AdminPolicies = () => {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [privacyPolicy, setPrivacyPolicy] = useState<PolicyContent>(defaultPolicies.privacy_policy);
  const [termsConditions, setTermsConditions] = useState<PolicyContent>(defaultPolicies.terms_conditions);
  const [cookiePolicy, setCookiePolicy] = useState<PolicyContent>(defaultPolicies.cookie_policy);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.privacy_policy) {
      setPrivacyPolicy(settings.privacy_policy as unknown as PolicyContent);
    }
    if (settings?.terms_conditions) {
      setTermsConditions(settings.terms_conditions as unknown as PolicyContent);
    }
    if (settings?.cookie_policy) {
      setCookiePolicy(settings.cookie_policy as unknown as PolicyContent);
    }
  }, [settings]);

  const handleSave = async (key: string, value: PolicyContent) => {
    setIsSaving(true);
    try {
      const { data: existingSetting } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", key)
        .maybeSingle();

      if (existingSetting) {
        await updateSetting.mutateAsync({
          key,
          value: { ...value, lastUpdated: new Date().toISOString().split("T")[0] } as unknown as Json,
        });
      } else {
        const { error } = await supabase.from("site_settings").insert({
          key,
          value: { ...value, lastUpdated: new Date().toISOString().split("T")[0] } as unknown as Json,
        });
        if (error) throw error;
      }

      toast({ title: "Policy saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save policy", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const PolicyEditor = ({
    policy,
    setPolicy,
    policyKey,
  }: {
    policy: PolicyContent;
    setPolicy: React.Dispatch<React.SetStateAction<PolicyContent>>;
    policyKey: string;
  }) => (
    <div className="space-y-4">
      <div>
        <Label>Page Title</Label>
        <Input
          value={policy.title}
          onChange={(e) => setPolicy({ ...policy, title: e.target.value })}
          className="bg-muted/50"
        />
      </div>
      <div>
        <Label>Content (Markdown supported - use ## for headings)</Label>
        <Textarea
          value={policy.content}
          onChange={(e) => setPolicy({ ...policy, content: e.target.value })}
          rows={20}
          className="bg-muted/50 font-mono text-sm"
          placeholder="## Section Title&#10;&#10;Your content here..."
        />
      </div>
      <Button
        variant="gradient"
        onClick={() => handleSave(policyKey, policy)}
        disabled={isSaving}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Policy Pages
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your Privacy Policy, Terms & Conditions, and Cookie Policy pages
          </p>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="glass rounded-xl p-6">
            <PolicyEditor
              policy={privacyPolicy}
              setPolicy={setPrivacyPolicy}
              policyKey="privacy_policy"
            />
          </TabsContent>

          <TabsContent value="terms" className="glass rounded-xl p-6">
            <PolicyEditor
              policy={termsConditions}
              setPolicy={setTermsConditions}
              policyKey="terms_conditions"
            />
          </TabsContent>

          <TabsContent value="cookies" className="glass rounded-xl p-6">
            <PolicyEditor
              policy={cookiePolicy}
              setPolicy={setCookiePolicy}
              policyKey="cookie_policy"
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPolicies;
