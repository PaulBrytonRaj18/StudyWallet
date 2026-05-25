import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "@/hooks/useSubjects";
import { useResources, useDeleteResource, useUpdateResource } from "@/hooks/useResources";
import { useChapters } from "@/hooks/useChapters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, FileText, Youtube, MessageSquare, StickyNote, ExternalLink, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Resource } from "@/types";

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  youtube_link: <Youtube className="h-4 w-4" />,
  chatgpt_link: <MessageSquare className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

export function ChapterDetail() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { data: subject } = useSubject(subjectId || "");
  const { data: chaptersData } = useChapters(subjectId || "");
  const { data: resourcesData } = useResources(subjectId || "", { chapter_id: chapterId });

  const deleteResource = useDeleteResource();
  const updateResource = useUpdateResource();

  const chapter = chaptersData?.chapters.find((c) => c.id === chapterId);
  const resources = resourcesData?.resources || [];

  const handleStatusChange = (resourceId: string, status: string) => {
    updateResource.mutate({ subjectId: subjectId!, resourceId, data: { status } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/subjects/${subjectId}`)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{chapter?.name || "Chapter"}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {subject?.name} / {chapter?.name}
          </p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No resources in this chapter</h3>
          <p className="text-sm text-muted-foreground">Add resources from the subject page</p>
          <Button className="mt-4" onClick={() => navigate(`/subjects/${subjectId}`)}>
            Back to Subject
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                  {resourceIcons[resource.resource_type] || <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{resource.title}</p>
                    {resource.importance === "important" && (
                      <Badge variant="warning">Important</Badge>
                    )}
                    {resource.importance === "very_important" && (
                      <Badge variant="destructive">Very Important</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Select value={resource.status} onValueChange={(v) => handleStatusChange(resource.id, v)}>
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
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {resource.url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      if (confirm("Delete resource?")) {
                        deleteResource.mutate({ subjectId: subjectId!, resourceId: resource.id });
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
    </div>
  );
}
