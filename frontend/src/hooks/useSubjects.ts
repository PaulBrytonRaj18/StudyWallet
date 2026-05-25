import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectService } from "@/services/subjectService";
import toast from "react-hot-toast";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectService.getAll(),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () => subjectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string; icon?: string }) =>
      subjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create subject");
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      subjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update subject");
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete subject");
    },
  });
}
