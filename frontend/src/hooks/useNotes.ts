import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "@/services/noteService";
import toast from "react-hot-toast";

export function useNotes(params?: { subject_id?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => noteService.getAll(params),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["notes", id],
    queryFn: () => noteService.getById(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content?: string; subject_id?: string; chapter_id?: string }) =>
      noteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create note");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      noteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update note");
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete note");
    },
  });
}
