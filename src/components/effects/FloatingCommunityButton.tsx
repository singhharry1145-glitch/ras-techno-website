import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSubmitCommunityApplication } from "@/hooks/useCommunityApplications";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  business_name: z.string().trim().max(150).optional().or(z.literal("")),
  business_type: z.string().trim().max(100).optional().or(z.literal("")),
  interests: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const FloatingCommunityButton = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    business_type: "",
    interests: "",
    message: "",
  });
  const { toast } = useToast();
  const submit = useSubmitCommunityApplication();
  const { data: settings } = useSiteSettings();
  const community = (settings?.community as Record<string, boolean>) || {};
  const buttonEnabled = community.button_enabled !== false;

  useEffect(() => {
    const open = () => setOpen(true);
    document.addEventListener("open-community-dialog", open);
    return () => document.removeEventListener("open-community-dialog", open);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    try {
      await submit.mutateAsync({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        business_name: parsed.data.business_name || undefined,
        business_type: parsed.data.business_type || undefined,
        interests: parsed.data.interests || undefined,
        message: parsed.data.message || undefined,
      });
      toast({
        title: "Application submitted!",
        description: "We'll review your details and get back to you shortly.",
      });
      setOpen(false);
      setForm({ name: "", email: "", phone: "", business_name: "", business_type: "", interests: "", message: "" });
    } catch {
      toast({ title: "Error", description: "Could not submit. Try again.", variant: "destructive" });
    }
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                style={{ display: buttonEnabled ? undefined : "none" }}
                className="fixed bottom-[14.5rem] right-4 z-[58] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-gradient-to-br from-cyan to-magenta text-primary-foreground animate-fade-in"
                aria-label="Join our community"
              >
                <span className="absolute inset-[-4px] rounded-full opacity-20 animate-pulse bg-primary" />
                <Users className="w-6 h-6 relative z-10" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Join our Community</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Join Our Business Community</DialogTitle>
          <DialogDescription>
            Connect with entrepreneurs, share ideas, learn growth strategies & meetups. Fill in your details — we'll
            verify and add you to our community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="c-name">Full Name *</Label>
              <Input id="c-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="c-bname">Business Name</Label>
              <Input id="c-bname" value={form.business_name} onChange={(e) => update("business_name", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-btype">Business Type / Industry</Label>
              <Input id="c-btype" value={form.business_type} onChange={(e) => update("business_type", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-int">What are you interested in?</Label>
              <Input
                id="c-int"
                placeholder="Ideas, growth strategies, meetups, networking..."
                value={form.interests}
                onChange={(e) => update("interests", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="c-msg">Tell us about yourself / your goals</Label>
              <Textarea id="c-msg" rows={3} value={form.message} onChange={(e) => update("message", e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingCommunityButton;
