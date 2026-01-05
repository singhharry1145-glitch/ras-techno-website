import { useState } from "react";
import { Plus, Edit2, Trash2, Trophy, Save, X, GripVertical, Upload, Image } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAwards, useCreateAward, useUpdateAward, useDeleteAward, Award } from "@/hooks/useAwards";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SortableAwardItemProps {
  award: Award;
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
  onToggleActive: (award: Award) => void;
}

const SortableAwardItem = ({ award, onEdit, onDelete, onToggleActive }: SortableAwardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: award.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl glass p-4 flex items-center gap-4 ${
        !award.is_active ? "opacity-60" : ""
      } ${isDragging ? "shadow-2xl ring-2 ring-primary" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {award.image_url ? (
        <img
          src={award.image_url}
          alt={award.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground flex-shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{award.title}</h3>
        {award.issuer && (
          <p className="text-sm text-muted-foreground truncate">{award.issuer}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={award.is_active}
          onCheckedChange={() => onToggleActive(award)}
        />
        <Button variant="ghost" size="icon" onClick={() => onEdit(award)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(award.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminAwards = () => {
  const { data: awards, isLoading } = useAwards();
  const createAward = useCreateAward();
  const updateAward = useUpdateAward();
  const deleteAward = useDeleteAward();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    description: "",
    image_url: "",
    date_received: "",
    display_order: 0,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      title: "",
      issuer: "",
      description: "",
      image_url: "",
      date_received: "",
      display_order: 0,
      is_active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (award: Award) => {
    setFormData({
      title: award.title,
      issuer: award.issuer || "",
      description: award.description || "",
      image_url: award.image_url || "",
      date_received: award.date_received || "",
      display_order: award.display_order,
      is_active: award.is_active,
    });
    setEditingId(award.id);
    setIsAdding(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `awards/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: "Success", description: "Image uploaded successfully." });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ title: "Error", description: "Title is required.", variant: "destructive" });
      return;
    }

    try {
      if (editingId) {
        await updateAward.mutateAsync({ id: editingId, ...formData });
        toast({ title: "Success", description: "Award updated successfully." });
      } else {
        await createAward.mutateAsync(formData);
        toast({ title: "Success", description: "Award created successfully." });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save award.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this award?")) return;

    try {
      await deleteAward.mutateAsync(id);
      toast({ title: "Success", description: "Award deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete award.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (award: Award) => {
    try {
      await updateAward.mutateAsync({ id: award.id, is_active: !award.is_active });
      toast({
        title: "Success",
        description: `Award ${award.is_active ? "hidden" : "shown"} on website.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update award.", variant: "destructive" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !awards) return;

    const oldIndex = awards.findIndex((a) => a.id === active.id);
    const newIndex = awards.findIndex((a) => a.id === over.id);

    const reorderedAwards = arrayMove(awards, oldIndex, newIndex);

    // Update display_order for all affected items
    try {
      await Promise.all(
        reorderedAwards.map((award, index) =>
          updateAward.mutateAsync({ id: award.id, display_order: index })
        )
      );
      toast({ title: "Success", description: "Order updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order.", variant: "destructive" });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Awards & Certificates</h1>
            <p className="text-muted-foreground">Manage your company awards and certifications. Drag to reorder.</p>
          </div>
          <Button
            variant="gradient"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Award
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="rounded-2xl glass p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {editingId ? "Edit Award" : "New Award"}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Award title"
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label>Issuer</Label>
                <Input
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="Issuing organization"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                className="bg-muted/50"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Award Image</Label>
              <div className="mt-2 flex flex-col sm:flex-row gap-4">
                {formData.image_url ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.image_url}
                      alt="Award preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30">
                    {isUploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Or enter image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-muted/50 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date Received</Label>
                <Input
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Show on website</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="gradient" onClick={handleSave} disabled={createAward.isPending || updateAward.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Create"} Award
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Awards List with Drag and Drop */}
        <div className="space-y-3">
          {awards?.length === 0 && !isAdding && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No awards added yet. Click "Add Award" to get started.</p>
            </div>
          )}

          {awards && awards.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={awards.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {awards.map((award) => (
                  <SortableAwardItem
                    key={award.id}
                    award={award}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAwards;
