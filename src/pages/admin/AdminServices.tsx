import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Save, X, Palette, Code, Bot, Settings, Database, Zap, Shield, Globe, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { useServices, useCreateService, useUpdateService, useDeleteService, Service } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "Code", label: "Code", icon: Code },
  { value: "Bot", label: "Bot/AI", icon: Bot },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "Database", label: "Database", icon: Database },
  { value: "Zap", label: "Lightning", icon: Zap },
  { value: "Shield", label: "Security", icon: Shield },
  { value: "Globe", label: "Globe", icon: Globe },
  { value: "Cpu", label: "CPU", icon: Cpu },
  { value: "Layers", label: "Layers", icon: Layers },
];

const colorOptions = [
  { value: "cyan", label: "Cyan" },
  { value: "magenta", label: "Magenta" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
];

const getIconComponent = (iconName: string) => {
  const option = iconOptions.find(opt => opt.value === iconName);
  return option?.icon || Settings;
};

interface ServiceFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string;
  display_order: number;
  is_active: boolean;
}

const defaultFormData: ServiceFormData = {
  title: "",
  description: "",
  icon: "Settings",
  color: "cyan",
  features: "",
  display_order: 0,
  is_active: true,
};

interface SortableServiceItemProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleActive: (service: Service) => void;
}

const SortableServiceItem = ({ service, onEdit, onDelete, onToggleActive }: SortableServiceItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = getIconComponent(service.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl glass ${!service.is_active ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              service.color === "cyan"
                ? "bg-gradient-to-br from-cyan/20 to-cyan/5 text-cyan"
                : service.color === "magenta"
                ? "bg-gradient-to-br from-magenta/20 to-magenta/5 text-magenta"
                : service.color === "purple"
                ? "bg-gradient-to-br from-purple/20 to-purple/5 text-purple"
                : "bg-gradient-to-br from-orange/20 to-orange/5 text-orange"
            }`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{service.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {service.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{service.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={service.is_active}
            onCheckedChange={() => onToggleActive(service)}
          />
          <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{service.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(service.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

const AdminServices = () => {
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const { toast } = useToast();
  
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({
      ...defaultFormData,
      display_order: (services?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      color: service.color,
      features: service.features.join("\n"),
      display_order: service.display_order,
      is_active: service.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const featuresArray = formData.features
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          features: featuresArray,
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
        toast({ title: "Service updated successfully" });
      } else {
        await createService.mutateAsync({
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          features: featuresArray,
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
        toast({ title: "Service created successfully" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error saving service", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id);
      toast({ title: "Service deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting service", variant: "destructive" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !services) return;

    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(services, oldIndex, newIndex);

    try {
      await Promise.all(
        reordered.map((service, index) =>
          updateService.mutateAsync({ id: service.id, display_order: index })
        )
      );
      toast({ title: "Order updated successfully" });
    } catch (error) {
      toast({ title: "Error updating order", variant: "destructive" });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await updateService.mutateAsync({
        id: service.id,
        is_active: !service.is_active,
      });
      toast({ title: `Service ${service.is_active ? "hidden" : "shown"}` });
    } catch (error) {
      toast({ title: "Error updating service", variant: "destructive" });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Services</h1>
            <p className="text-muted-foreground">Manage your services displayed on the website.</p>
          </div>
          <Button variant="gradient" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services?.map((s) => s.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {services?.map((service) => (
                <SortableServiceItem
                  key={service.id}
                  service={service}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onToggleActive={toggleActive}
                />
              ))}

              {(!services || services.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No services yet. Click "Add Service" to create one.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Service title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${opt.value}`} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                {editingService ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;