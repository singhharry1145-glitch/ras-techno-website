import { useState } from "react";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCommunityMeetings,
  useUpsertCommunityMeeting,
  useDeleteCommunityMeeting,
  CommunityMeeting,
} from "@/hooks/useCommunityMeetings";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";

const empty = {
  id: "",
  title: "",
  description: "",
  meeting_date: new Date().toISOString().split("T")[0],
  attendees_count: 0,
  location: "",
  is_published: true,
  display_order: 0,
};

const AdminCommunityMeetings = () => {
  const { data: meetings, isLoading } = useCommunityMeetings();
  const upsert = useUpsertCommunityMeeting();
  const remove = useDeleteCommunityMeeting();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const { data: settings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const community = (settings?.community as Record<string, boolean>) || {};
  const visibility = (settings?.section_visibility as Record<string, boolean>) || {};

  const setFeature = async (key: string, value: boolean, settingKey: "community" | "section_visibility" = "community") => {
    const current = (settings?.[settingKey] as Record<string, boolean>) || {};
    await updateSettings.mutateAsync({ key: settingKey, value: { ...current, [key]: value } });
  };

  const startEdit = (m: CommunityMeeting) => {
    setForm({
      id: m.id,
      title: m.title,
      description: m.description || "",
      meeting_date: m.meeting_date,
      attendees_count: m.attendees_count,
      location: m.location || "",
      is_published: m.is_published,
      display_order: m.display_order,
    });
    setOpen(true);
  };

  const startNew = () => {
    setForm(empty);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.meeting_date) {
      toast({ title: "Title and date required", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({
        ...(form.id ? { id: form.id } : {}),
        title: form.title.trim(),
        description: form.description || null,
        meeting_date: form.meeting_date,
        attendees_count: Number(form.attendees_count) || 0,
        location: form.location || null,
        is_published: form.is_published,
        display_order: Number(form.display_order) || 0,
      } as any);
      toast({ title: form.id ? "Meeting updated" : "Meeting added" });
      setOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meeting?")) return;
    await remove.mutateAsync(id);
    toast({ title: "Deleted" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Community Meetings</h1>
            <p className="text-muted-foreground">{meetings?.length || 0} total meetings</p>
          </div>
          <Button variant="gradient" onClick={startNew}>
            <Plus className="w-4 h-4 mr-2" /> Add Meeting
          </Button>
        </div>

        <div className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-display font-semibold text-lg mb-2">Community Page Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Show Community page</span>
              <Switch
                checked={visibility.community_page !== false}
                onCheckedChange={(v) => setFeature("community_page", v, "section_visibility")}
              />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Show floating Community button</span>
              <Switch
                checked={community.button_enabled !== false}
                onCheckedChange={(v) => setFeature("button_enabled", v)}
              />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Show stats counters</span>
              <Switch checked={community.show_stats !== false} onCheckedChange={(v) => setFeature("show_stats", v)} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Show charts</span>
              <Switch checked={community.show_chart !== false} onCheckedChange={(v) => setFeature("show_chart", v)} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Show meeting list</span>
              <Switch checked={community.show_meetings !== false} onCheckedChange={(v) => setFeature("show_meetings", v)} />
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : meetings && meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl glass flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan/20 to-magenta/20 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">{m.title}</span>
                    {!m.is_published && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.meeting_date).toLocaleDateString()} • {m.attendees_count} attendees
                    {m.location && ` • ${m.location}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(m)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-2xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No meetings yet</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Meeting" : "Add Meeting"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} />
              </div>
              <div>
                <Label>Attendees</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.attendees_count}
                  onChange={(e) => setForm({ ...form, attendees_count: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
              <span className="text-sm">Published (visible on Community page)</span>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            </label>
            <Button variant="gradient" className="w-full" onClick={submit} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving..." : form.id ? "Update Meeting" : "Add Meeting"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCommunityMeetings;
