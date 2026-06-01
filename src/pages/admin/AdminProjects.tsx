import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

const categories = [
  "Animation & Creative Design",
  "IT Services & Consultancy",
  "AI Support & Automation",
  "Software Development",
  "Data Analytics",
];

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  image_url: string;
  tags: string;
  is_published: boolean;
  display_order: number;
}

const defaultFormData: ProjectFormData = {
  title: "",
  description: "",
  category: categories[0],
  image_url: "",
  tags: "",
  is_published: true,
  display_order: 0,
};

interface SortableProjectItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onTogglePublished: (project: Project) => void;
}

const SortableProjectItem = ({ project, onEdit, onDelete, onTogglePublished }: SortableProjectItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl glass overflow-hidden ${
        !project.is_published ? "opacity-60" : ""
      }`}
    >
      {/* Project Image */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{
          background: project.image_url
            ? `url(${project.image_url}) center/cover`
            : "linear-gradient(135deg, hsl(var(--cyan)), hsl(var(--magenta)))",
        }}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          {!project.is_published && (
            <span className="px-2 py-1 text-xs bg-background/80 text-muted-foreground rounded-full">
              Draft
            </span>
          )}
        </div>
        <button
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 cursor-grab active:cursor-grabbing p-1 rounded bg-background/50 hover:bg-background/80 transition-colors"
        >
          <GripVertical className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      {/* Project Info */}
      <div className="p-4">
        <p className="text-xs text-primary mb-1">{project.category}</p>
        <h3 className="font-display font-semibold text-foreground mb-2">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={() => onTogglePublished(project)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {project.is_published ? (
              <>
                <Eye className="w-4 h-4" />
                Published
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Draft
              </>
            )}
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || "",
        category: project.category,
        image_url: project.image_url || "",
        tags: project.tags?.join(", ") || "",
        is_published: project.is_published,
        display_order: project.display_order,
      });
    } else {
      setEditingProject(null);
      setFormData({
        ...defaultFormData,
        display_order: (projects?.length || 0) + 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      image_url: formData.image_url || null,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: formData.is_published,
      display_order: formData.display_order,
    };

    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, ...projectData });
        toast({
          title: "Project Updated",
          description: "The project has been updated successfully.",
        });
      } else {
        await createProject.mutateAsync(projectData);
        toast({
          title: "Project Created",
          description: "The project has been added successfully.",
        });
      }
      closeModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await deleteProject.mutateAsync(id);
      toast({
        title: "Project Deleted",
        description: "The project has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (project: Project) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        is_published: !project.is_published,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && projects) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const reorderedProjects = arrayMove(projects, oldIndex, newIndex);

      // Update display_order for all affected items
      try {
        await Promise.all(
          reorderedProjects.map((project, index) =>
            updateProject.mutateAsync({
              id: project.id,
              display_order: index,
            })
          )
        );
        toast({
          title: "Order Updated",
          description: "Project order has been saved.",
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Manage your portfolio projects ({projects?.length || 0} total) • Drag to reorder
            </p>
          </div>
          <Button variant="gradient" onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onTogglePublished={togglePublished}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12 glass rounded-2xl">
            <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button variant="gradient" onClick={() => openModal()}>
              Add Your First Project
            </Button>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="bg-muted/50 mt-1"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-muted/50 text-foreground mt-1"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-muted/50 mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="bg-muted/50 mt-1"
              />
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Web Development, React, UI/UX"
                className="bg-muted/50 mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={createProject.isPending || updateProject.isPending}
              >
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProjects;
