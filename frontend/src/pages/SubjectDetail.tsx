import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubject } from "@/hooks/useSubjects";
import { useChapters, useCreateChapter, useDeleteChapter } from "@/hooks/useChapters";
import { useResources, useCreateResource, useDeleteResource, useUpdateResource, usePDFUpload } from "@/hooks/useResources";
import { pdfService } from "@/services/pdfService";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FormField } from "@/components/ui/form";
import { chapterCreateSchema, resourceCreateSchema, type ChapterCreateInput, type ResourceCreateInput } from "@/lib/validation";
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

function isLinkType(type: string): boolean {
  return type === "youtube_link" || type === "chatgpt_link";
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileError, setSelectedFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chapters = chaptersData?.chapters || [];
  const resources = resourcesData?.resources || [];
  const completedCount = resources.filter((r) => r.status === "completed").length;

  const chapterForm = useForm<ChapterCreateInput>({
    resolver: zodResolver(chapterCreateSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  const resourceForm = useForm<ResourceCreateInput>({
    resolver: zodResolver(resourceCreateSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      resource_type: "note",
      status: "not_started",
      importance: "normal",
      url: "",
      chapter_id: "",
      tags: "",
    },
  });

  const watchedResourceType = resourceForm.watch("resource_type");

  const handleCreateChapter = (formData: ChapterCreateInput) => {
    createChapter.mutate(
      { subjectId: subjectId!, data: formData },
      {
        onSuccess: () => {
          setChapterDialog(false);
          chapterForm.reset();
        },
      }
    );
  };

  const handleCreateResource = (formData: ResourceCreateInput) => {
    if (watchedResourceType === "pdf") {
      if (!selectedFile) {
        setSelectedFileError("Please select a PDF file");
        return;
      }
      if (selectedFile.type !== "application/pdf") {
        setSelectedFileError("File must be a PDF");
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setSelectedFileError("File must be smaller than 20MB");
        return;
      }
      setSelectedFileError(null);
      uploadPDF.mutate(
        {
          file: selectedFile,
          data: {
            title: formData.title,
            subject_id: subjectId!,
            chapter_id: formData.chapter_id || undefined,
            description: formData.description || undefined,
            tags: typeof formData.tags === "string" ? formData.tags : "",
            importance: formData.importance,
          },
        },
        {
          onSuccess: () => {
            setResourceDialog(false);
            setSelectedFile(null);
            resourceForm.reset();
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        }
      );
    } else {
      const tags = Array.isArray(formData.tags)
        ? formData.tags
        : typeof formData.tags === "string" && formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];

      if (isLinkType(watchedResourceType) && !formData.url) {
        toast.error("URL is required for this resource type");
        return;
      }

      createResource.mutate(
        {
          subjectId: subjectId!,
          data: {
            ...formData,
            subject_id: subjectId!,
            tags,
          },
        },
        {
          onSuccess: () => {
            setResourceDialog(false);
            resourceForm.reset();
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
              <form onSubmit={resourceForm.handleSubmit(handleCreateResource)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Type</label>
                  <Select
                    value={resourceForm.watch("resource_type")}
                    onValueChange={(v) => resourceForm.setValue("resource_type", v as ResourceCreateInput["resource_type"])}
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
                <FormField<ResourceCreateInput>
                  label="Title"
                  name="title"
                  register={resourceForm.register}
                  errors={resourceForm.formState.errors}
                  required
                >
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      {...resourceForm.register("title")}
                    />
                  )}
                </FormField>
                {watchedResourceType === "pdf" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">PDF File</label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file) {
                          if (file.type !== "application/pdf") {
                            setSelectedFileError("File must be a PDF");
                          } else if (file.size > 20 * 1024 * 1024) {
                            setSelectedFileError("File must be smaller than 20MB");
                          } else {
                            setSelectedFileError(null);
                          }
                        } else {
                          setSelectedFileError(null);
                        }
                      }}
                    />
                    {selectedFileError && (
                      <p className="text-sm text-destructive" role="alert">{selectedFileError}</p>
                    )}
                    {selectedFile && !selectedFileError && (
                      <p className="text-xs text-muted-foreground">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    )}
                  </div>
                ) : (
                  <FormField<ResourceCreateInput>
                    label={isLinkType(watchedResourceType) ? "URL" : "URL (optional)"}
                    name="url"
                    register={resourceForm.register}
                    errors={resourceForm.formState.errors}
                    required={isLinkType(watchedResourceType)}
                  >
                    {(fieldProps) => (
                      <Input
                        {...fieldProps}
                        placeholder="https://"
                        {...resourceForm.register("url")}
                      />
                    )}
                  </FormField>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Chapter (optional)</label>
                  <Select
                    value={resourceForm.watch("chapter_id") || ""}
                    onValueChange={(v) => resourceForm.setValue("chapter_id", v || undefined)}
                  >
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
                    <label className="text-sm font-medium leading-none">Status</label>
                    <Select
                      value={resourceForm.watch("status")}
                      onValueChange={(v) => resourceForm.setValue("status", v as ResourceCreateInput["status"])}
                    >
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
                    <label className="text-sm font-medium leading-none">Importance</label>
                    <Select
                      value={resourceForm.watch("importance")}
                      onValueChange={(v) => resourceForm.setValue("importance", v as ResourceCreateInput["importance"])}
                    >
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
                <FormField<ResourceCreateInput>
                  label="Tags (comma separated)"
                  name="tags"
                  register={resourceForm.register}
                  errors={resourceForm.formState.errors}
                >
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      placeholder="quantum, physics"
                      {...resourceForm.register("tags")}
                    />
                  )}
                </FormField>
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
                <form onSubmit={chapterForm.handleSubmit(handleCreateChapter)} className="space-y-4">
                  <FormField<ChapterCreateInput>
                    label="Name"
                    name="name"
                    register={chapterForm.register}
                    errors={chapterForm.formState.errors}
                    required
                  >
                    {(fieldProps) => (
                      <Input
                        {...fieldProps}
                        {...chapterForm.register("name")}
                      />
                    )}
                  </FormField>
                  <FormField<ChapterCreateInput>
                    label="Description (optional)"
                    name="description"
                    register={chapterForm.register}
                    errors={chapterForm.formState.errors}
                  >
                    {(fieldProps) => (
                      <Input
                        {...fieldProps}
                        {...chapterForm.register("description")}
                      />
                    )}
                  </FormField>
                  <Button type="submit" className="w-full" disabled={!chapterForm.formState.isValid || createChapter.isPending}>
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
