import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubjects, useCreateSubject, useDeleteSubject } from "@/hooks/useSubjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreVertical, BookOpen, Trash2, BookMarked } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { subjectCreateSchema, type SubjectCreateInput } from "@/lib/validation";

export function Subjects() {
  const { data, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SubjectCreateInput>({
    resolver: zodResolver(subjectCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
    },
  });

  const onCreate = (formData: SubjectCreateInput) => {
    createSubject.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this subject and all its contents?")) {
      deleteSubject.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <FormField<SubjectCreateInput>
                label="Name"
                name="name"
                register={register}
                errors={errors}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="e.g., Physics"
                    {...register("name")}
                  />
                )}
              </FormField>
              <FormField<SubjectCreateInput>
                label="Description (optional)"
                name="description"
                register={register}
                errors={errors}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="Subject description"
                    {...register("description")}
                  />
                )}
              </FormField>
              <FormField<SubjectCreateInput>
                label="Color"
                name="color"
                register={register}
                errors={errors}
              >
                {(fieldProps) => (
                  <div className="flex items-center gap-3">
                    <input
                      {...fieldProps}
                      type="color"
                      {...register("color")}
                      className="h-10 w-10 rounded-md border cursor-pointer"
                    />
                  </div>
                )}
              </FormField>
              <Button type="submit" className="w-full" disabled={!isValid || createSubject.isPending}>
                {createSubject.isPending ? "Creating..." : "Create Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : data?.subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No subjects yet</h3>
          <p className="text-sm text-muted-foreground">Create your first subject to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.subjects.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: subject.color + "20", color: subject.color }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/subjects/${subject.id}`); }}>
                      <BookOpen className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => handleDelete(subject.id, e)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{subject.name}</CardTitle>
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{subject.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{subject.chapter_count || 0} chapters</span>
                  <span>{subject.resource_count || 0} resources</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
