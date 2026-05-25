import { useState } from "react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, StickyNote, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useSubjects } from "@/hooks/useSubjects";

export function Notes() {
  const { data, isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { data: subjectsData } = useSubjects();
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    subject_id: "",
    chapter_id: "",
  });

  const subjects = subjectsData?.subjects || [];
  const notes = data?.notes || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ title: "", content: "", subject_id: "", chapter_id: "" });
        setPreviewMode(false);
      },
    });
  };

  const handleUpdate = (id: string) => {
    updateNote.mutate({ id, data: { title: form.title, content: form.content } });
    setEditingNote(null);
  };

  const startEdit = (note: any) => {
    setEditingNote(note.id);
    setForm({ title: note.title, content: note.content || "", subject_id: note.subject_id || "", chapter_id: "" });
    setPreviewMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Subject (optional)</Label>
                  <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content (Markdown)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {previewMode ? "Edit" : "Preview"}
                  </Button>
                </div>
                {previewMode ? (
                  <div className="flex-1 overflow-y-auto rounded-md border p-4 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{form.content}</ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="flex-1 min-h-[300px] font-mono text-sm"
                    placeholder="Write your notes in markdown..."
                  />
                )}
              </div>
              <Button type="submit" disabled={createNote.isPending}>
                {createNote.isPending ? "Creating..." : "Create Note"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No notes yet</h3>
          <p className="text-sm text-muted-foreground">Start writing your study notes</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base truncate">{note.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(note)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (confirm("Delete note?")) deleteNote.mutate(note.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-4">
                    <ReactMarkdown>{note.content.slice(0, 200)}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No content</p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingNote} onOpenChange={(open) => { if (!open) setEditingNote(null); }}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content</Label>
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {previewMode ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewMode ? (
                <div className="flex-1 overflow-y-auto rounded-md border p-4 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="flex-1 min-h-[300px] font-mono text-sm"
                />
              )}
            </div>
            <Button onClick={() => editingNote && handleUpdate(editingNote)} disabled={updateNote.isPending}>
              {updateNote.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
