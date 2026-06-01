import { useState } from "react";
import * as XLSX from "xlsx";
import { Users, Trash2, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useCommunityApplications,
  useUpdateCommunityApplication,
  useDeleteCommunityApplication,
  CommunityApplication,
} from "@/hooks/useCommunityApplications";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminCommunity = () => {
  const { data: apps, isLoading } = useCommunityApplications();
  const update = useUpdateCommunityApplication();
  const remove = useDeleteCommunityApplication();
  const { toast } = useToast();
  const [selected, setSelected] = useState<CommunityApplication | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = apps?.filter((a) => filter === "all" || a.status === filter);

  const exportExcel = () => {
    if (!apps?.length) {
      toast({ title: "No data", description: "Nothing to export." });
      return;
    }
    const rows = apps.map((a) => ({
      Name: a.name,
      Email: a.email,
      Phone: a.phone || "",
      "Business Name": a.business_name || "",
      "Business Type": a.business_type || "",
      Interests: a.interests || "",
      Message: a.message || "",
      Status: a.status,
      "Submitted At": new Date(a.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Community");
    XLSX.writeFile(wb, `community-applications-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({ title: "Exported", description: "Excel file downloaded." });
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await update.mutateAsync({ id, status });
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      setSelected(null);
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const statusBadge = (s: string) => {
    const cfg: Record<string, { cls: string; icon: typeof Clock }> = {
      pending: { cls: "bg-yellow-500/20 text-yellow-500", icon: Clock },
      approved: { cls: "bg-green-500/20 text-green-500", icon: CheckCircle2 },
      rejected: { cls: "bg-red-500/20 text-red-500", icon: XCircle },
    };
    const c = cfg[s] || cfg.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${c.cls}`}>
        <Icon className="w-3 h-3" /> {s}
      </span>
    );
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Community Applications</h1>
            <p className="text-muted-foreground">{apps?.length || 0} total applications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
            <Button variant="gradient" size="sm" onClick={exportExcel}>
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          </div>
        </div>

        {filtered && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="w-full text-left p-4 sm:p-6 rounded-2xl glass hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan/20 to-magenta/20 flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{a.name}</span>
                      {statusBadge(a.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                    {a.business_name && <p className="text-sm">{a.business_name}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-2xl">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selected.name}</DialogTitle>
                <DialogDescription>{selected.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4 text-sm">
                {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}
                {selected.business_name && <p><strong>Business:</strong> {selected.business_name}</p>}
                {selected.business_type && <p><strong>Type:</strong> {selected.business_type}</p>}
                {selected.interests && <p><strong>Interests:</strong> {selected.interests}</p>}
                {selected.message && (
                  <div className="p-4 rounded-xl bg-muted/50 whitespace-pre-wrap">{selected.message}</div>
                )}
                <p className="text-muted-foreground text-xs">
                  Submitted: {new Date(selected.created_at).toLocaleString()}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Select value={selected.status} onValueChange={(v) => setStatus(selected.id, v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" onClick={() => handleDelete(selected.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCommunity;
