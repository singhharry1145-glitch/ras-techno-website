import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useWhyChooseUs, useWhyChooseUsMutations, WhyChooseUsItem } from "@/hooks/useWhyChooseUs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";

const getIcon = (name: string | null) => {
  if (!name) return Star;
  return (LucideIcons as any)[name] || Star;
};

const AdminWhyChooseUs = () => {
  const { data: items = [], isLoading } = useWhyChooseUs();
  const { createItem, updateItem, deleteItem } = useWhyChooseUsMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WhyChooseUsItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "Star" });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", icon: "Star" });
    setDialogOpen(true);
  };

  const openEdit = (item: WhyChooseUsItem) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "", icon: item.icon || "Star" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) {
      updateItem.mutate({ id: editing.id, ...form });
    } else {
      createItem.mutate({ ...form, display_order: items.length });
    }
    setDialogOpen(false);
  };

  const handleToggle = (item: WhyChooseUsItem) => {
    updateItem.mutate({ id: item.id, is_active: !item.is_active });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Why Choose Us</h1>
            <p className="text-muted-foreground">Manage your unique value propositions</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Point</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Key Points ({items.length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No items yet. Add your first one!</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const Icon = getIcon(item.icon);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{item.description || "No description"}</p>
                      </div>
                      <Switch checked={item.is_active} onCheckedChange={() => handleToggle(item)} />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem.mutate(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Key Point</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Expert Team" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Why this matters..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Icon Name (Lucide)</label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Star, Shield, Zap" />
              <p className="text-xs text-muted-foreground mt-1">Use icon names from lucide.dev/icons</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.title.trim()}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWhyChooseUs;
