import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  Client,
} from "@/hooks/useClients";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableClientItemProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onToggleActive: (client: Client) => void;
}

const SortableClientItem = ({ client, onEdit, onDelete, onToggleActive }: SortableClientItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 sm:p-6 rounded-xl glass ${!client.is_active ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {client.logo_url ? (
            <img src={client.logo_url} alt={client.name} className="w-12 h-12 object-contain rounded-lg bg-muted" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-primary-foreground font-bold">
              {client.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleActive(client)}
            title={client.is_active ? "Hide" : "Activate"}
            className="h-8 w-8"
          >
            {client.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(client)} className="h-8 w-8">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(client.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-1">{client.name}</h3>
      {client.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{client.description}</p>
      )}
      {client.website_url && (
        <a
          href={client.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Visit website
        </a>
      )}
    </div>
  );
};

const AdminClients = () => {
  const { toast } = useToast();
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    is_active: true,
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
      name: "",
      logo_url: "",
      website_url: "",
      description: "",
      is_active: true,
      display_order: 0,
    });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      logo_url: client.logo_url || "",
      website_url: client.website_url || "",
      description: client.description || "",
      is_active: client.is_active,
      display_order: client.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, ...formData });
        toast({ title: "Client updated successfully" });
      } else {
        await createClient.mutateAsync({
          ...formData,
          display_order: (clients?.length || 0) + 1,
        });
        toast({ title: "Client added successfully" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: error.message || "Failed to save client", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient.mutateAsync(id);
      toast({ title: "Client deleted successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete client", variant: "destructive" });
    }
  };

  const toggleActive = async (client: Client) => {
    try {
      await updateClient.mutateAsync({
        id: client.id,
        is_active: !client.is_active,
      });
      toast({ title: `Client ${client.is_active ? "hidden" : "activated"}` });
    } catch (error: any) {
      toast({ title: error.message || "Failed to update client", variant: "destructive" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && clients) {
      const oldIndex = clients.findIndex((c) => c.id === active.id);
      const newIndex = clients.findIndex((c) => c.id === over.id);

      const reorderedClients = arrayMove(clients, oldIndex, newIndex);

      // Update display_order for all affected items
      try {
        await Promise.all(
          reorderedClients.map((client, index) =>
            updateClient.mutateAsync({
              id: client.id,
              display_order: index,
            })
          )
        );
        toast({
          title: "Order Updated",
          description: "Client order has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update order.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your client portfolio ({clients?.length || 0} total) • Drag to reorder
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of the client..."
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingClient ? "Update" : "Add"}
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
        ) : clients && clients.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={clients.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <SortableClientItem
                    key={client.id}
                    client={client}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={toggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground glass rounded-xl">
            No clients yet. Add your first client!
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
