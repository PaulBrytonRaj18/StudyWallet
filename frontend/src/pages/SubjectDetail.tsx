import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "@/hooks/useSubjects";
import { useChapters, useCreateChapter, useDeleteChapter } from "@/hooks/useChapters";
import { useResources, useCreateResource, useDeleteResource, useUpdateResource, usePDFUpload } from "@/hooks/useResources";
import { pdfService } from "@/services/pdfService";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ChevronLeft,
  FileText,
  Youtube,
  MessageSquare,
  StickyNote,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Resource, ResourceType, ResourceStatus } from "@/types";

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  youtube_link: <Youtube className="h-4 w-4" />,
  chatgpt_link: <MessageSquare className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  studying: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  revision_pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

export function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { data: subject, isLoading: subjectLoading } = useSubject(subjectId || "");
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters(subjectId || "");
  const { data: resourcesData } = useResources(subjectId || "");

  const createChapter = useCreateChapter();
  const deleteChapter = useDeleteChapter();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();
  const updateResource = useUpdateResource();
  const uploadPDF = usePDFUpload();

  const [chapterDialog, setChapterDialog] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chapterForm, setChapterForm] = useState({ name: "", description: "" });
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    resource_type: "note" as ResourceType,
    status: "not_started" as ResourceStatus,
    importance: "normal",
    url: "",
    chapter_id: "",
    tags: "",
  });

  const chapters = chaptersData?.chapters || [];
  const resources = resourcesData?.resources || [];
  const completedCount = resources.filter((r) => r.status === "completed").length;

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    createChapter.mutate(
      { subjectId: subjectId!, data: chapterForm },
      {
        onSuccess: () => {
          setChapterDialog(false);
          setChapterForm({ name: "", description: "" });
        },
      }
    );
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();

    if (resourceForm.resource_type === "pdf") {
      if (!selectedFile) {
        toast.error("Please select a PDF file");
        return;
      }
      uploadPDF.mutate(
        {
          file: selectedFile,
          data: {
            title: resourceForm.title,
            subject_id: subjectId!,
            chapter_id: resourceForm.chapter_id || undefined,
            description: resourceForm.description || undefined,
            tags: resourceForm.tags,
            importance: resourceForm.importance,
          },
        },
        {
          onSuccess: () => {
            setResourceDialog(false);
            setSelectedFile(null);
            setResourceForm({
              title: "",
              description: "",
              resource_type: "note",
              status: "not_started",
              importance: "normal",
              url: "",
              chapter_id: "",
              tags: "",
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        }
      );
    } else {
      createResource.mutate(
        {
          subjectId: subjectId!,
          data: {
            ...resourceForm,
            subject_id: subjectId!,
            tags: resourceForm.tags ? resourceForm.tags.split(",").map((t) => t.trim()) : [],
          },
        },
        {
          onSuccess: () => {
            setResourceDialog(false);
            setResourceForm({
              title: "",
              description: "",
              resource_type: "note",
              status: "not_started",
              importance: "normal",
              url: "",
              chapter_id: "",
              tags: "",
            });
          },
        }
      );
    }
  };

  const handleViewPDF = async (resourceId: string) => {
    try {
      const result = await pdfService.getSignedUrl(resourceId);
      window.open(result.signed_url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to open PDF");
    }
  };

  const handleStatusChange = (resourceId: string, status: string) => {
    updateResource.mutate({ subjectId: subjectId!, resourceId, data: { status } });
  };

  if (subjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/subjects")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: subject?.color }}
            />
            <h1 className="text-2xl font-bold">{subject?.name}</h1>
          </div>
          {subject?.description && (
            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{resources.length} completed
            </span>
            <span className="text-sm font-medium">
              {resources.length > 0 ? Math.round((completedCount / resources.length) * 100) : 0}%
            </span>
          </div>
          <Progress value={resources.length > 0 ? (completedCount / resources.length) * 100 : 0} />
        </div>
      </div>

      <Tabs defaultValue="resources">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="chapters">Chapters ({chapters.length})</TabsTrigger>
          </TabsList>

          <Dialog open={resourceDialog} onOpenChange={setResourceDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={resourceForm.resource_type}
                    onValueChange={(v) => setResourceForm({ ...resourceForm, resource_type: v as ResourceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="youtube_link">YouTube Link</SelectItem>
                      <SelectItem value="chatgpt_link">ChatGPT Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} required />
                </div>
                {resourceForm.resource_type === "pdf" ? (
                  <div className="space-y-2">
                    <Label>PDF File</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>URL ({resourceForm.resource_type === "note" ? "optional" : "required"})</Label>
                    <Input value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Chapter (optional)</Label>
                  <Select value={resourceForm.chapter_id} onValueChange={(v) => setResourceForm({ ...resourceForm, chapter_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="No chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No chapter</SelectItem>
                      {chapters.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={resourceForm.status} onValueChange={(v) => setResourceForm({ ...resourceForm, status: v as ResourceStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="studying">Studying</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="revision_pending">Revision Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Importance</Label>
                    <Select value={resourceForm.importance} onValueChange={(v) => setResourceForm({ ...resourceForm, importance: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="very_important">Very Important</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input value={resourceForm.tags} onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })} placeholder="quantum, physics" />
                </div>
                <Button type="submit" className="w-full" disabled={createResource.isPending || uploadPDF.isPending}>
                  {uploadPDF.isPending ? "Uploading..." : createResource.isPending ? "Adding..." : "Add Resource"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="resources" className="space-y-4 mt-4">
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <StickyNote className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No resources yet</h3>
              <p className="text-sm text-muted-foreground">Add your first resource to this subject</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onStatusChange={(status) => handleStatusChange(resource.id, status)}
                  onDelete={() => deleteResource.mutate({ subjectId: subjectId!, resourceId: resource.id })}
                  onViewPDF={() => handleViewPDF(resource.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Chapters</h3>
            <Dialog open={chapterDialog} onOpenChange={setChapterDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chapter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Chapter</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateChapter} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={chapterForm.name} onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input value={chapterForm.description} onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createChapter.isPending}>
                    {createChapter.isPending ? "Creating..." : "Create Chapter"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No chapters yet</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Card key={chapter.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/subjects/${subjectId}/chapters/${chapter.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{chapter.name}</p>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {chapter.resource_count || 0} resources
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete chapter?")) {
                            deleteChapter.mutate({ subjectId: subjectId!, chapterId: chapter.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceCard({
  resource,
  onStatusChange,
  onDelete,
  onViewPDF,
}: {
  resource: Resource;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onViewPDF: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
          {resourceIcons[resource.resource_type] || <FileText className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{resource.title}</p>
            {resource.importance === "important" && (
              <Badge variant="warning" className="shrink-0">Important</Badge>
            )}
            {resource.importance === "very_important" && (
              <Badge variant="destructive" className="shrink-0">Very Important</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Select value={resource.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-6 text-xs px-2 py-0 border-0 bg-transparent gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="studying">Studying</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="revision_pending">Revision Pending</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </span>
          </div>
          {resource.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {resource.file_name && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {resource.file_name}
              {resource.file_size && ` (${(resource.file_size / 1024 / 1024).toFixed(1)} MB)`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {resource.pdf_url && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onViewPDF} title="View PDF">
              <FileText className="h-4 w-4" />
            </Button>
          )}
          {resource.url && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
