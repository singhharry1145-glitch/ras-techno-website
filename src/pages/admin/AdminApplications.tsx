import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Trash2, FileUser, Mail, Phone, Linkedin, Building, Clock } from "lucide-react";
import {
  useJobApplications,
  useUpdateJobApplication,
  useDeleteJobApplication,
  JobApplication,
} from "@/hooks/useJobApplications";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  reviewing: "bg-blue-500/10 text-blue-500",
  shortlisted: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  hired: "bg-purple-500/10 text-purple-500",
};

const AdminApplications = () => {
  const { data: applications, isLoading } = useJobApplications();
  const updateApplication = useUpdateJobApplication();
  const deleteApplication = useDeleteJobApplication();

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleViewApplication = async (app: JobApplication) => {
    setSelectedApp(app);
    if (!app.is_read) {
      try {
        await updateApplication.mutateAsync({ id: app.id, is_read: true });
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateApplication.mutateAsync({ id, status });
      toast.success("Application status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApplication.mutateAsync(deleteId);
      toast.success("Application deleted!");
    } catch (error) {
      toast.error("Failed to delete application");
    }
    setDeleteId(null);
  };

  const unreadCount = applications?.filter((a) => !a.is_read).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Job Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread application(s)` : "Review candidate applications"}
            </p>
          </div>
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
        ) : applications && applications.length > 0 ? (
          <div className="grid gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`glass p-6 rounded-xl border ${
                  app.is_read ? "border-border" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {app.name}
                      </h3>
                      {!app.is_read && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          New
                        </Badge>
                      )}
                      <Badge className={statusColors[app.status] || statusColors.pending}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">
                      Applied for: {app.job_posts?.title || "Unknown Position"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </span>
                      {app.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </span>
                      )}
                      {app.experience_years && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {app.experience_years} years exp
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Applied: {format(new Date(app.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={app.status}
                      onValueChange={(value) => handleStatusChange(app.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewApplication(app)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(app.id)}
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
            <FileUser className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No Applications Yet
            </h3>
            <p className="text-muted-foreground">
              Applications will appear here when candidates apply for your job posts.
            </p>
          </div>
        )}
      </div>

      {/* View Application Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.job_posts?.title || "Job Application"}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {selectedApp.name}
                  </h3>
                  <Badge className={statusColors[selectedApp.status]}>
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedApp.email}`} className="hover:text-primary">
                      {selectedApp.email}
                    </a>
                  </div>
                  {selectedApp.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedApp.phone}`} className="hover:text-primary">
                        {selectedApp.phone}
                      </a>
                    </div>
                  )}
                  {selectedApp.current_company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {selectedApp.current_company}
                    </div>
                  )}
                  {selectedApp.experience_years && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {selectedApp.experience_years} years of experience
                    </div>
                  )}
                  {selectedApp.linkedin_url && (
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <Linkedin className="w-4 h-4" />
                      <a
                        href={selectedApp.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary break-all"
                      >
                        {selectedApp.linkedin_url}
                      </a>
                    </div>
                  )}
                </div>

                {selectedApp.cover_letter && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Cover Letter</h4>
                    <div className="p-4 bg-muted/50 rounded-lg text-muted-foreground whitespace-pre-wrap">
                      {selectedApp.cover_letter}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Applied on: {format(new Date(selectedApp.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Select
                  value={selectedApp.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedApp.id, value);
                    setSelectedApp({ ...selectedApp, status: value });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The application will be permanently deleted.
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

export default AdminApplications;
