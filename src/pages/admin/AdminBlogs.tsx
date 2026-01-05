import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  Blog,
} from "@/hooks/useBlogs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminBlogs = () => {
  const { toast } = useToast();
  const { data: blogs, isLoading } = useBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    author: "Admin",
    category: "",
    tags: [] as string[],
    is_published: true,
    published_at: null as string | null,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      author: "Admin",
      category: "",
      tags: [],
      is_published: true,
      published_at: null,
    });
    setEditingBlog(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      cover_image: blog.cover_image || "",
      author: blog.author,
      category: blog.category || "",
      tags: blog.tags || [],
      is_published: blog.is_published,
      published_at: blog.published_at,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const blogData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      published_at: formData.is_published && !formData.published_at ? new Date().toISOString() : formData.published_at,
    };

    try {
      if (editingBlog) {
        await updateBlog.mutateAsync({ id: editingBlog.id, ...blogData });
        toast({ title: "Blog updated successfully" });
      } else {
        await createBlog.mutateAsync(blogData);
        toast({ title: "Blog created successfully" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: error.message || "Failed to save blog", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteBlog.mutateAsync(id);
      toast({ title: "Blog deleted successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete blog", variant: "destructive" });
    }
  };

  const togglePublished = async (blog: Blog) => {
    try {
      await updateBlog.mutateAsync({
        id: blog.id,
        is_published: !blog.is_published,
        published_at: !blog.is_published ? new Date().toISOString() : blog.published_at,
      });
      toast({ title: `Blog ${blog.is_published ? "hidden" : "published"}` });
    } catch (error: any) {
      toast({ title: error.message || "Failed to update blog", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Create and manage blog articles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingBlog ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    required
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className="bg-muted/50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Technology, Animation"
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Brief summary of the article..."
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Content *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                    placeholder="Full article content..."
                    className="bg-muted/50"
                  />
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
                    {editingBlog ? "Update" : "Create"}
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
          <div className="grid gap-4">
            {blogs?.map((blog) => (
              <div
                key={blog.id}
                className={`p-4 sm:p-6 rounded-xl glass ${!blog.is_published ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{blog.title}</h3>
                        {blog.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            {blog.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {blog.excerpt || blog.content.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {blog.author}</span>
                      {blog.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(blog.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublished(blog)}
                      title={blog.is_published ? "Hide" : "Publish"}
                    >
                      {blog.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(blog.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {blogs?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No blog posts yet. Create your first article!
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBlogs;
