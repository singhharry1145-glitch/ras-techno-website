import { useState } from "react";
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  Testimonial,
} from "@/hooks/useTestimonials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface SortableTestimonialItemProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
  onTogglePublished: (testimonial: Testimonial) => void;
}

const SortableTestimonialItem = ({ testimonial, onEdit, onDelete, onTogglePublished }: SortableTestimonialItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 sm:p-6 rounded-xl glass ${!testimonial.is_published ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center sm:justify-start"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{testimonial.client_name}</h3>
              {(testimonial.client_position || testimonial.client_company) && (
                <p className="text-sm text-muted-foreground">
                  {testimonial.client_position}
                  {testimonial.client_position && testimonial.client_company && " at "}
                  {testimonial.client_company}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-3">{testimonial.content}</p>
        </div>
        <div className="flex sm:flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePublished(testimonial)}
            title={testimonial.is_published ? "Hide" : "Publish"}
          >
            {testimonial.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(testimonial)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(testimonial.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminTestimonials = () => {
  const { toast } = useToast();
  const { data: testimonials, isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    client_name: "",
    client_position: "",
    client_company: "",
    client_image: "",
    content: "",
    rating: 5,
    is_published: true,
    display_order: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData({
      client_name: "",
      client_position: "",
      client_company: "",
      client_image: "",
      content: "",
      rating: 5,
      is_published: true,
      display_order: 0,
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      client_position: testimonial.client_position || "",
      client_company: testimonial.client_company || "",
      client_image: testimonial.client_image || "",
      content: testimonial.content,
      rating: testimonial.rating,
      is_published: testimonial.is_published,
      display_order: testimonial.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({
          id: editingTestimonial.id,
          ...formData,
        });
        toast({ title: "Testimonial updated successfully" });
      } else {
        await createTestimonial.mutateAsync(formData);
        toast({ title: "Testimonial created successfully" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: error.message || "Failed to save testimonial", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial.mutateAsync(id);
      toast({ title: "Testimonial deleted successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete testimonial", variant: "destructive" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !testimonials) return;

    const oldIndex = testimonials.findIndex((t) => t.id === active.id);
    const newIndex = testimonials.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(testimonials, oldIndex, newIndex);

    try {
      await Promise.all(
        reordered.map((testimonial, index) =>
          updateTestimonial.mutateAsync({ id: testimonial.id, display_order: index })
        )
      );
      toast({ title: "Order updated successfully" });
    } catch (error) {
      toast({ title: "Error updating order", variant: "destructive" });
    }
  };

  const togglePublished = async (testimonial: Testimonial) => {
    try {
      await updateTestimonial.mutateAsync({
        id: testimonial.id,
        is_published: !testimonial.is_published,
      });
      toast({ title: `Testimonial ${testimonial.is_published ? "hidden" : "published"}` });
    } catch (error: any) {
      toast({ title: error.message || "Failed to update testimonial", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Testimonials</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage client reviews and testimonials</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={formData.client_position}
                      onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={formData.client_company}
                      onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                <div>
                  <Label>Client Image URL</Label>
                  <Input
                    value={formData.client_image}
                    onChange={(e) => setFormData({ ...formData, client_image: e.target.value })}
                    placeholder="https://..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Testimonial Content *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                    className="bg-muted/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Published</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingTestimonial ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={testimonials?.map((t) => t.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {testimonials?.map((testimonial) => (
                  <SortableTestimonialItem
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={togglePublished}
                  />
                ))}
                {testimonials?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No testimonials yet. Add your first testimonial!
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
