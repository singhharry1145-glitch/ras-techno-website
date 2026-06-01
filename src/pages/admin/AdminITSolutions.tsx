import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useItSolutions, useItSolutionsMutations, ItSolution } from "@/hooks/useItSolutions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Monitor } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const getIcon = (name: string | null) => {
  if (!name) return Monitor;
  return (LucideIcons as any)[name] || Monitor;
};

interface SortableItemProps {
  solution: ItSolution;
  onEdit: (s: ItSolution) => void;
  onDelete: (id: string) => void;
  onToggle: (s: ItSolution) => void;
}

const SortableItem = ({ solution, onEdit, onDelete, onToggle }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: solution.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = getIcon(solution.icon);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{solution.title}</h4>
        <p className="text-sm text-muted-foreground truncate">{solution.description || "No description"}</p>
      </div>
      <Switch checked={solution.is_active} onCheckedChange={() => onToggle(solution)} />
      <Button variant="ghost" size="icon" onClick={() => onEdit(solution)}><Pencil className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(solution.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
    </div>
  );
};

const AdminITSolutions = () => {
  const { data: solutions = [], isLoading } = useItSolutions();
  const { createSolution, updateSolution, deleteSolution, reorderSolutions } = useItSolutionsMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItSolution | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "Monitor", learn_more_url: "", image_url: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", icon: "Monitor", learn_more_url: "", image_url: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: ItSolution) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description || "", icon: s.icon || "Monitor", learn_more_url: s.learn_more_url || "", image_url: s.image_url || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) {
      updateSolution.mutate({ id: editing.id, ...form });
    } else {
      createSolution.mutate({ ...form, display_order: solutions.length });
    }
    setDialogOpen(false);
  };

  const handleToggle = (s: ItSolution) => {
    updateSolution.mutate({ id: s.id, is_active: !s.is_active });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = solutions.findIndex((s) => s.id === active.id);
    const newIndex = solutions.findIndex((s) => s.id === over.id);
    const reordered = [...solutions];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderSolutions.mutate(reordered.map((s, i) => ({ id: s.id, display_order: i })));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">IT Solutions</h1>
            <p className="text-muted-foreground">Manage your IT solutions showcase</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Solution</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Solutions ({solutions.length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : solutions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No solutions yet. Add your first one!</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={solutions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {solutions.map((s) => (
                      <SortableItem key={s.id} solution={s} onEdit={openEdit} onDelete={(id) => deleteSolution.mutate(id)} onToggle={handleToggle} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} IT Solution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Solution title" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Icon Name (Lucide)</label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. Monitor, Shield, Cloud" />
              <p className="text-xs text-muted-foreground mt-1">Use icon names from lucide.dev/icons</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Learn More URL</label>
              <Input value={form.learn_more_url} onChange={(e) => setForm({ ...form, learn_more_url: e.target.value })} placeholder="https://..." />
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

export default AdminITSolutions;
