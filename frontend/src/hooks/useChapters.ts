import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chapterService } from "@/services/chapterService";
import toast from "react-hot-toast";

export function useChapters(subjectId: string) {
  return useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: () => chapterService.getAll(subjectId),
    enabled: !!subjectId,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: string;
      data: { name: string; description?: string };
    }) => chapterService.create(subjectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", variables.subjectId] });
      toast.success("Chapter created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create chapter");
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      chapterId,
      data,
    }: {
      subjectId: string;
      chapterId: string;
      data: Partial<any>;
    }) => chapterService.update(subjectId, chapterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", variables.subjectId] });
      toast.success("Chapter updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update chapter");
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, chapterId }: { subjectId: string; chapterId: string }) =>
      chapterService.delete(subjectId, chapterId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", variables.subjectId] });
      toast.success("Chapter deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete chapter");
    },
  });
}
