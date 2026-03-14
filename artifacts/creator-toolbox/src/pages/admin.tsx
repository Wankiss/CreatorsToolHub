import { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useAdminGetStats, useAdminListTools, useAdminDeleteTool, 
  useAdminCreateTool, useAdminUpdateTool 
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
import { BarChart3, Wrench, FileText, Trash2, Edit, Plus, FolderOpen, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  return (
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
          </TabsList>

          <TabsContent value="stats">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="tools">
            <ToolsManager />
          </TabsContent>
          
          <TabsContent value="blog">
            <Card className="p-16 text-center border-dashed border-2">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold">Blog Manager</h3>
              <p className="text-muted-foreground mt-2">Blog management interface goes here. Pattern matches tools manager.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
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
