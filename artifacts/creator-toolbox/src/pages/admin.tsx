import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { 
  useAdminGetStats, useAdminListTools, useAdminDeleteTool, 
  useAdminCreateTool, useAdminUpdateTool,
  useAdminCreateBlogPost, useAdminUpdateBlogPost, useAdminDeleteBlogPost
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Wrench, FileText, Trash2, Edit, Plus, FolderOpen, Eye, EyeOff, Mail, Upload, X, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const HARDCODED_AUTHOR = "Immanuels";

function useCoverImageUpload(onUploaded: (objectPath: string) => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const metaRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "image/jpeg" }),
      });
      if (!metaRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await metaRes.json();

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      if (!putRes.ok) throw new Error("Failed to upload to storage");

      onUploaded(`/api/storage${objectPath}`);
      toast({ title: "Image uploaded successfully" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [onUploaded, toast]);

  return { uploadFile, isUploading, uploadError };
}

const ADMIN_PASSWORD = "ctHub2026!";

function AdminGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    try { return sessionStorage.getItem("ctadmin") === "1"; } catch { return false; }
  });
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  if (authenticated) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      try { sessionStorage.setItem("ctadmin", "1"); } catch {}
      setAuthenticated(true);
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter the admin password to continue.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={pw}
              autoFocus
              onChange={e => { setPw(e.target.value); setError(false); }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-destructive text-sm text-center">Incorrect password.</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGate>
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage tools, categories, and content.</p>
        </div>

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 rounded-xl">
            <TabsTrigger value="stats" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-sm"><BarChart3 className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-sm"><Wrench className="w-4 h-4 mr-2" /> Tools Management</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-sm"><FileText className="w-4 h-4 mr-2" /> Blog Content</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg px-6 py-2.5 data-[state=active]:shadow-sm"><Mail className="w-4 h-4 mr-2" /> Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="tools">
            <ToolsManager />
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="messages">
            <ContactMessages />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    </AdminGate>
  );
}

function StatsOverview() {
  const { data, isLoading } = useAdminGetStats();

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tools" value={data.totalTools} icon={<Wrench />} />
        <StatCard title="Categories" value={data.totalCategories} icon={<FolderOpen />} />
        <StatCard title="Total Posts" value={data.totalBlogPosts} icon={<FileText />} />
        <StatCard title="Usage (Today)" value={data.totalUsageToday} icon={<BarChart3 />} color="text-primary" />
      </div>

      <Card className="p-6">
        <h3 className="font-bold font-display text-lg mb-6">Top Performing Tools</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Usage Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topTools.map(tool => (
              <TableRow key={tool.slug}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground">{tool.slug}</TableCell>
                <TableCell className="text-right font-bold text-primary">{tool.usageCount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-foreground" }: any) {
  return (
    <Card className="p-6 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-medium">{title}</span>
        <div className="opacity-50">{icon}</div>
      </div>
      <div className={`text-4xl font-bold font-display ${color}`}>{value.toLocaleString()}</div>
    </Card>
  );
}

function ToolsManager() {
  const { data, isLoading } = useAdminListTools();
  const deleteMutation = useAdminDeleteTool();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
          toast({ title: "Tool deleted" });
        }
      });
    }
  };

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold font-display text-xl">Manage Tools</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Tool</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tool</DialogTitle>
            </DialogHeader>
            <ToolForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.tools.map(tool => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium text-muted-foreground">{tool.id}</TableCell>
                <TableCell className="text-xl">{tool.icon}</TableCell>
                <TableCell className="font-bold">{tool.name}</TableCell>
                <TableCell><span className="bg-secondary px-2 py-1 rounded text-xs font-medium">{tool.categoryName}</span></TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${tool.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {tool.isActive ? 'Active' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(tool.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function BlogManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteMutation = useAdminDeleteBlogPost();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/blog'],
    queryFn: async () => {
      const res = await fetch('/api/admin/blog');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<{ posts: any[], total: number }>;
    }
  });

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
        queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
        toast({ title: "Post deleted" });
      },
      onError: () => toast({ title: "Error", description: "Could not delete post", variant: "destructive" }),
    });
  };

  if (isLoading) return <Skeleton className="h-[500px] rounded-xl" />;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold font-display text-xl">Blog Posts</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} total articles</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Blog Post</DialogTitle></DialogHeader>
            <BlogForm onSuccess={() => { setIsCreateOpen(false); queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] }); queryClient.invalidateQueries({ queryKey: ['/api/blog'] }); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Read Time</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[280px]">
                  <p className="line-clamp-1 font-semibold">{post.title}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{post.slug}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((t: string) => (
                      <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{t}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                    post.isPublished
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {post.isPublished ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{post.readingTime} min</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editPost?.id === post.id} onOpenChange={open => { if (!open) setEditPost(null); }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Edit Blog Post</DialogTitle></DialogHeader>
                        <BlogForm
                          initialData={editPost}
                          onSuccess={() => {
                            setEditPost(null);
                            queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
                            queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(post.id, post.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function BlogForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: any }) {
  const createMutation = useAdminCreateBlogPost();
  const updateMutation = useAdminUpdateBlogPost();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    tags: initialData?.tags?.join(", ") ?? "",
    coverImage: initialData?.coverImage ?? "",
    faqSchema: initialData?.faqSchema ?? "",
    metaTitle: initialData?.metaTitle ?? "",
    metaDescription: initialData?.metaDescription ?? "",
    isPublished: initialData?.isPublished ?? false,
  });

  const setField = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const { uploadFile, isUploading, uploadError } = useCoverImageUpload((objectPath) => {
    setField("coverImage", objectPath);
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      author: HARDCODED_AUTHOR,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      metaTitle: form.metaTitle || form.title,
      metaDescription: form.metaDescription || form.excerpt,
    };

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: payload }, {
        onSuccess: () => { toast({ title: "Post updated!" }); onSuccess(); },
        onError: () => toast({ title: "Error", description: "Could not update post", variant: "destructive" }),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Post created!" }); onSuccess(); },
        onError: () => toast({ title: "Error", description: "Could not create post", variant: "destructive" }),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Title & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label>Title *</Label>
          <Input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="How to Go Viral on TikTok in 2026" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Slug (auto-generated if empty)</Label>
          <Input value={form.slug} onChange={e => setField('slug', e.target.value)} placeholder="how-to-go-viral-tiktok-2026" className="font-mono text-sm" />
        </div>
      </div>

      {/* Author (read-only display) */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 border border-border/50">
        <img src="/immanuels-avatar.png" alt="Immanuels" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Author</p>
          <p className="text-sm font-semibold">{HARDCODED_AUTHOR}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label>Tags (comma-separated)</Label>
        <Input value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="TikTok Growth, Viral Content, Strategy" />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label>Excerpt (shown in listings) *</Label>
        <Textarea value={form.excerpt} onChange={e => setField('excerpt', e.target.value)} rows={2} placeholder="A compelling 1-2 sentence summary..." />
      </div>

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-4 space-y-3">
          {form.coverImage ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={form.coverImage} alt="Cover preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => setField('coverImage', '')}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No image selected</p>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? "Uploading..." : form.coverImage ? "Replace Image" : "Upload Image"}
            </Button>
            {form.coverImage && (
              <p className="text-xs text-muted-foreground truncate flex-1 font-mono">{form.coverImage}</p>
            )}
          </div>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label>Content (HTML) *</Label>
        <Textarea value={form.content} onChange={e => setField('content', e.target.value)} rows={12} placeholder="<h2>...</h2><p>...</p>" className="font-mono text-sm" />
        <p className="text-xs text-muted-foreground">Write full HTML content. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a href&gt; etc.</p>
      </div>

      {/* SEO Metadata */}
      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <p className="text-sm font-semibold text-muted-foreground">SEO Metadata (optional — auto-fills from title/excerpt)</p>
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input value={form.metaTitle} onChange={e => setField('metaTitle', e.target.value)} placeholder="Defaults to post title" />
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description (140–160 chars)</Label>
          <Textarea value={form.metaDescription} onChange={e => setField('metaDescription', e.target.value)} rows={2} placeholder="Defaults to excerpt" />
          <p className="text-xs text-muted-foreground">{form.metaDescription.length} / 160 characters</p>
        </div>
      </div>

      {/* FAQ Schema (JSON-LD) */}
      <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">FAQ Schema (JSON-LD)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Paste an array of FAQ objects. Will be injected as structured data in the page &lt;head&gt;.</p>
        </div>
        <Textarea
          value={form.faqSchema}
          onChange={e => setField('faqSchema', e.target.value)}
          rows={6}
          placeholder={`[\n  { "question": "What is this tool?", "answer": "It's a free creator tool." },\n  { "question": "Is it free?", "answer": "Yes, completely free." }\n]`}
          className="font-mono text-xs"
        />
        {form.faqSchema && (() => {
          try { JSON.parse(form.faqSchema); return null; }
          catch { return <p className="text-xs text-destructive">⚠ Invalid JSON — fix before saving</p>; }
        })()}
      </div>

      {/* Publish toggle */}
      <div className="flex items-center space-x-2 py-3 border-t">
        <Switch id="published" checked={form.isPublished} onCheckedChange={c => setField('isPublished', c)} />
        <Label htmlFor="published" className="cursor-pointer">Publish immediately (make visible to readers)</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={isPending || isUploading || !form.title || !form.content || !form.excerpt}>
          {isPending ? "Saving..." : initialData?.id ? "Update Post" : "Publish Post"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ToolForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const createMutation = useAdminCreateTool();
  const updateMutation = useAdminUpdateTool();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    categoryId: initialData?.categoryId || 1, // Defaulting for simple demo
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    icon: initialData?.icon || "✨",
    isActive: initialData?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = initialData ? updateMutation : createMutation;
    const args = initialData ? { id: initialData.id, data: formData } : { data: formData };

    // @ts-ignore generic calling
    mutation.mutate(args, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
        toast({ title: initialData ? "Tool updated" : "Tool created successfully!" });
        onSuccess();
      },
      onError: (err) => {
        toast({ title: "Error", description: "Could not save tool", variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="YouTube Title Generator" />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="youtube-title-generator" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon (Emoji)</Label>
          <Input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Category ID</Label>
          <Input type="number" required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Short Description (Card)</Label>
        <Input required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} />
      </div>

      <div className="space-y-2">
        <Label>Full Description (Header)</Label>
        <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>

      <div className="flex items-center space-x-2 py-4 border-t">
        <Switch id="active" checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
        <Label htmlFor="active">Tool is Active and Public</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save Tool</Button>
      </DialogFooter>
    </form>
  );
}

function ContactMessages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/messages'],
    queryFn: async () => {
      const res = await fetch('/api/admin/messages');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<{ messages: any[]; total: number }>;
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      toast({ title: "Message deleted" });
      if (expanded === id) setExpanded(null);
    } catch {
      toast({ title: "Error", description: "Could not delete message", variant: "destructive" });
    }
  };

  if (isLoading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold font-display text-xl">Contact Messages</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} total messages</p>
        </div>
      </div>

      {!data?.messages.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No messages yet</p>
          <p className="text-sm mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.messages.map(msg => (
            <div key={msg.id} className="rounded-xl border border-border overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{msg.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[240px]">{msg.subject}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, yyyy · h:mm a') : ''}
                  </span>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expanded === msg.id && (
                <div className="px-5 pb-5 border-t border-border bg-muted/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">From</p>
                      <p className="font-medium">{msg.name}</p>
                      <a href={`mailto:${msg.email}`} className="text-primary hover:underline text-sm">{msg.email}</a>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Subject</p>
                      <p className="font-medium">{msg.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Received</p>
                      <p className="font-medium">{msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, yyyy') : ''}</p>
                      <p className="text-muted-foreground text-xs">{msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Message</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-background rounded-lg p-4 border border-border">{msg.message}</p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button size="sm" asChild>
                      <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                        <Mail className="w-3.5 h-3.5 mr-2" /> Reply via Email
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
