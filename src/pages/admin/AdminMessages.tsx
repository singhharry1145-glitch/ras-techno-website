import { useState } from "react";
import { Mail, MailOpen, Trash2, Building, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { useContactMessages, useMarkMessageRead, useDeleteMessage, ContactMessage } from "@/hooks/useContactMessages";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const AdminMessages = () => {
  const { data: messages, isLoading } = useContactMessages();
  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();
  const { toast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredMessages = messages?.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const handleMarkRead = async (id: string, is_read: boolean) => {
    try {
      await markRead.mutateAsync({ id, is_read });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage.mutateAsync(id);
      setSelectedMessage(null);
      toast({
        title: "Message Deleted",
        description: "The message has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkRead(message.id, true);
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
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Contact Messages</h1>
            <p className="text-muted-foreground">
              {messages?.length || 0} total messages, {messages?.filter((m) => !m.is_read).length || 0} unread
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Read
            </Button>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages && filteredMessages.length > 0 ? (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => openMessage(message)}
                className={`w-full text-left p-4 sm:p-6 rounded-2xl glass transition-all duration-300 hover:border-primary/30 ${
                  !message.is_read ? "border-primary/20 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.is_read
                        ? "bg-muted"
                        : "bg-gradient-to-br from-cyan/20 to-magenta/20"
                    }`}
                  >
                    {message.is_read ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Mail className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{message.name}</span>
                      {!message.is_read && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{message.email}</p>
                    <p className="text-sm text-foreground truncate">{message.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-2xl">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selectedMessage.name}</DialogTitle>
                <DialogDescription>{selectedMessage.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selectedMessage.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{selectedMessage.company}</span>
                    </div>
                  )}
                  {selectedMessage.service && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>{selectedMessage.service}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleMarkRead(selectedMessage.id, !selectedMessage.is_read)}
                  >
                    {selectedMessage.is_read ? (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Mark Unread
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-4 h-4 mr-2" />
                        Mark Read
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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

export default AdminMessages;
