import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/searchService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, FileText, Youtube, MessageSquare, StickyNote, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  youtube_link: <Youtube className="h-4 w-4" />,
  chatgpt_link: <MessageSquare className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

export function Search() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    resource_type: "",
    status: "",
    importance: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["search", query, filters],
    queryFn: () =>
      searchService.search({
        q: query,
        resource_type: filters.resource_type || undefined,
        status: filters.status || undefined,
        importance: filters.importance || undefined,
      }),
    enabled: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground">Search across all your resources</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.resource_type}
          onValueChange={(v) => setFilters({ ...filters, resource_type: v })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="youtube_link">YouTube</SelectItem>
            <SelectItem value="chatgpt_link">ChatGPT</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="studying">Studying</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="revision_pending">Revision Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.importance}
          onValueChange={(v) => setFilters({ ...filters, importance: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Importance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="very_important">Very Important</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : data?.results.length ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{data.total} results found</p>
          {data.results.map((result) => (
            <Card key={result.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                  {resourceIcons[result.resource_type] || <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {result.resource_type.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant={
                        result.importance === "very_important"
                          ? "destructive"
                          : result.importance === "important"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {result.importance}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge
                      variant={
                        result.status === "completed"
                          ? "success"
                          : result.status === "studying"
                          ? "info"
                          : result.status === "revision_pending"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {result.status.replace("_", " ")}
                    </Badge>
                    {result.subject_name && (
                      <span className="text-xs text-muted-foreground">{result.subject_name}</span>
                    )}
                    {result.chapter_name && (
                      <span className="text-xs text-muted-foreground">&middot; {result.chapter_name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {result.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {(result.url || result.pdf_url) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <a href={result.url || result.pdf_url!} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-sm text-muted-foreground">Try different search terms</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Search your study materials</h3>
          <p className="text-sm text-muted-foreground">Type a query and press search</p>
        </div>
      )}
    </div>
  );
}
