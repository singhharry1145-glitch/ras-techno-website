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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import {
  useJobPosts,
  useCreateJobPost,
  useUpdateJobPost,
  useDeleteJobPost,
  JobPost,
} from "@/hooks/useJobPosts";
import { format } from "date-fns";

const AdminCareers = () => {
  const { data: jobs, isLoading } = useJobPosts();
  const createJob = useCreateJobPost();
  const updateJob = useUpdateJobPost();
  const deleteJob = useDeleteJobPost();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "Full-time",
    description: "",
    requirements: "",
    benefits: "",
    salary_range: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      location: "",
      employment_type: "Full-time",
      description: "",
      requirements: "",
      benefits: "",
      salary_range: "",
      is_active: true,
    });
    setEditingJob(null);
  };

  const handleEdit = (job: JobPost) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department || "",
      location: job.location || "",
      employment_type: job.employment_type || "Full-time",
      description: job.description,
      requirements: job.requirements?.join("\n") || "",
      benefits: job.benefits?.join("\n") || "",
      salary_range: job.salary_range || "",
      is_active: job.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobData = {
        title: formData.title,
        department: formData.department || null,
        location: formData.location || null,
        employment_type: formData.employment_type,
        description: formData.description,
        requirements: formData.requirements ? formData.requirements.split("\n").filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split("\n").filter(Boolean) : [],
        salary_range: formData.salary_range || null,
        is_active: formData.is_active,
      };

      if (editingJob) {
        await updateJob.mutateAsync({ id: editingJob.id, ...jobData });
        toast.success("Job post updated successfully!");
      } else {
        await createJob.mutateAsync(jobData);
        toast.success("Job post created successfully!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save job post");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteJob.mutateAsync(deleteId);
      toast.success("Job post deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete job post");
    }
    setDeleteId(null);
  };

  const handleToggleActive = async (job: JobPost) => {
    try {
      await updateJob.mutateAsync({ id: job.id, is_active: !job.is_active });
      toast.success(`Job post ${!job.is_active ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error("Failed to update job post");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Career Posts
            </h1>
            <p className="text-muted-foreground mt-1">Manage job listings and positions</p>
          </div>
          <Button
            variant="gradient"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job Post
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
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`glass p-6 rounded-xl border ${
                  job.is_active ? "border-border" : "border-destructive/30 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {job.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          job.is_active
                            ? "bg-green-500/10 text-green-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {job.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      {job.department && <span>{job.department}</span>}
                      {job.location && <span>• {job.location}</span>}
                      {job.employment_type && <span>• {job.employment_type}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Posted: {format(new Date(job.posted_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={job.is_active}
                      onCheckedChange={() => handleToggleActive(job)}
                    />
                    <Button variant="outline" size="icon" onClick={() => handleEdit(job)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(job.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-xl">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No Job Posts</h3>
            <p className="text-muted-foreground mb-4">Create your first job listing</p>
            <Button
              variant="gradient"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Job Post
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Post" : "Create Job Post"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the job listing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Senior React Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Remote, India"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Employment Type</Label>
                  <Input
                    id="type"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    placeholder="e.g., Full-time"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g., ₹8-12 LPA"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                />
              </div>
              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  placeholder="5+ years of experience&#10;Proficiency in React&#10;Strong communication skills"
                />
              </div>
              <div>
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  rows={3}
                  placeholder="Health insurance&#10;Flexible work hours&#10;Remote work option"
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
                disabled={createJob.isPending || updateJob.isPending}
              >
                {createJob.isPending || updateJob.isPending
                  ? "Saving..."
                  : editingJob
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
            <AlertDialogTitle>Delete Job Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job listing and all associated applications.
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

export default AdminCareers;
