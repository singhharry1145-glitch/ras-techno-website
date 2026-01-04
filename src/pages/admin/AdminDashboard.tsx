import { LayoutDashboard, Mail, FolderOpen, Palette, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useContactMessages } from "@/hooks/useContactMessages";
import { useProjects } from "@/hooks/useProjects";

const AdminDashboard = () => {
  const { data: messages } = useContactMessages();
  const { data: projects } = useProjects();

  const unreadMessages = messages?.filter((m) => !m.is_read).length || 0;
  const totalMessages = messages?.length || 0;
  const publishedProjects = projects?.filter((p) => p.is_published).length || 0;
  const totalProjects = projects?.length || 0;

  const stats = [
    {
      label: "Unread Messages",
      value: unreadMessages,
      total: totalMessages,
      icon: Mail,
      color: "cyan",
      href: "/admin/messages",
    },
    {
      label: "Published Projects",
      value: publishedProjects,
      total: totalProjects,
      icon: FolderOpen,
      color: "magenta",
      href: "/admin/projects",
    },
  ];

  const quickActions = [
    { label: "Theme & Colors", href: "/admin/theme", icon: Palette, description: "Customize gradients and colors" },
    { label: "Section Content", href: "/admin/sections", icon: LayoutDashboard, description: "Edit website content" },
    { label: "Messages", href: "/admin/messages", icon: Mail, description: "View contact submissions" },
    { label: "Projects", href: "/admin/projects", icon: FolderOpen, description: "Manage portfolio projects" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your website.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="p-6 rounded-2xl glass hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === "cyan"
                      ? "bg-gradient-to-br from-cyan/20 to-cyan/5"
                      : "bg-gradient-to-br from-magenta/20 to-magenta/5"
                  }`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${stat.color === "cyan" ? "text-cyan" : "text-magenta"}`}
                  />
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                  <span className="text-lg text-muted-foreground font-normal"> / {stat.total}</span>
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="p-4 rounded-xl glass hover:border-primary/30 transition-all duration-300 group"
              >
                <action.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        {messages && messages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">Recent Messages</h2>
              <Link to="/admin/messages" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {messages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-xl glass ${!message.is_read ? "border-primary/30" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{message.name}</span>
                      {!message.is_read && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">New</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
