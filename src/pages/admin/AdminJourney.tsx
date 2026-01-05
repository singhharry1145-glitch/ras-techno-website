import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Flag, Star, Rocket, Award, Target, Zap, GripVertical } from "lucide-react";
import {
  useJourneyMilestones,
  useCreateJourneyMilestone,
  useUpdateJourneyMilestone,
  useDeleteJourneyMilestone,
  JourneyMilestone,
} from "@/hooks/useJourneyMilestones";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const iconOptions = [
  { value: "Star", icon: Star },
  { value: "Rocket", icon: Rocket },
  { value: "Award", icon: Award },
  { value: "Flag", icon: Flag },
  { value: "Target", icon: Target },
  { value: "Zap", icon: Zap },
];

interface SortableMilestoneItemProps {
  milestone: JourneyMilestone;
  onEdit: (milestone: JourneyMilestone) => void;
  onDelete: (id: string) => void;
  onToggleActive: (milestone: JourneyMilestone) => void;
}

const SortableMilestoneItem = ({ milestone, onEdit, onDelete, onToggleActive }: SortableMilestoneItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = iconOptions.find((i) => i.value === milestone.icon)?.icon || Star;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass p-6 rounded-xl border ${
        milestone.is_active ? "border-border" : "border-destructive/30 opacity-60"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none mt-2"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-magenta flex items-center justify-center shrink-0">
            <IconComponent className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {milestone.year}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  milestone.is_active
                    ? "bg-green-500/10 text-green-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {milestone.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {milestone.title}
            </h3>
            {milestone.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {milestone.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={milestone.is_active}
            onCheckedChange={() => onToggleActive(milestone)}
          />
          <Button variant="outline" size="icon" onClick={() => onEdit(milestone)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(milestone.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminJourney = () => {
  const { data: milestones, isLoading } = useJourneyMilestones();
  const createMilestone = useCreateJourneyMilestone();
  const updateMilestone = useUpdateJourneyMilestone();
  const deleteMilestone = useDeleteJourneyMilestone();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<JourneyMilestone | null>(null);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    description: "",
    icon: "Star",
    display_order: 0,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      year: "",
      title: "",
      description: "",
      icon: "Star",
      display_order: milestones?.length || 0,
      is_active: true,
    });
    setEditingMilestone(null);
  };

  const handleEdit = (milestone: JourneyMilestone) => {
    setEditingMilestone(milestone);
    setFormData({
      year: milestone.year,
      title: milestone.title,
      description: milestone.description || "",
      icon: milestone.icon || "Star",
      display_order: milestone.display_order,
      is_active: milestone.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const milestoneData = {
        year: formData.year,
        title: formData.title,
        description: formData.description || null,
        icon: formData.icon,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingMilestone) {
        await updateMilestone.mutateAsync({ id: editingMilestone.id, ...milestoneData });
        toast.success("Milestone updated successfully!");
      } else {
        await createMilestone.mutateAsync(milestoneData);
        toast.success("Milestone created successfully!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save milestone");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMilestone.mutateAsync(deleteId);
      toast.success("Milestone deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete milestone");
    }
    setDeleteId(null);
  };

  const handleToggleActive = async (milestone: JourneyMilestone) => {
    try {
      await updateMilestone.mutateAsync({ id: milestone.id, is_active: !milestone.is_active });
      toast.success(`Milestone ${!milestone.is_active ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error("Failed to update milestone");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !milestones) return;

    const oldIndex = milestones.findIndex((m) => m.id === active.id);
    const newIndex = milestones.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(milestones, oldIndex, newIndex);

    try {
      await Promise.all(
        reordered.map((milestone, index) =>
          updateMilestone.mutateAsync({ id: milestone.id, display_order: index })
        )
      );
      toast.success("Order updated successfully");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleDirectDelete = async (id: string) => {
    try {
      await deleteMilestone.mutateAsync(id);
      toast.success("Milestone deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete milestone");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Our Journey
            </h1>
            <p className="text-muted-foreground mt-1">Manage company timeline milestones</p>
          </div>
          <Button
            variant="gradient"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-6 rounded-xl animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-4" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : milestones && milestones.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={milestones.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {milestones.map((milestone) => (
                  <SortableMilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    onEdit={handleEdit}
                    onDelete={handleDirectDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 glass rounded-xl">
            <Flag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No Milestones</h3>
            <p className="text-muted-foreground mb-4">Create your first journey milestone</p>
            <Button
              variant="gradient"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
            <DialogDescription>
              Add a significant event or achievement to your company timeline
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.value}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Company Founded"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this milestone..."
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active (visible on website)</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={createMilestone.isPending || updateMilestone.isPending}
              >
                {createMilestone.isPending || updateMilestone.isPending
                  ? "Saving..."
                  : editingMilestone
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The milestone will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminJourney;
