import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/services/resourceService";
import { pdfService } from "@/services/pdfService";
import toast from "react-hot-toast";

export function useResources(
  subjectId: string,
  params?: {
    chapter_id?: string;
    resource_type?: string;
    status?: string;
    importance?: string;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ["resources", subjectId, params],
    queryFn: () => resourceService.getAll(subjectId, params),
    enabled: !!subjectId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: string;
      data: Partial<any>;
    }) => resourceService.create(subjectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.subjectId] });
      toast.success("Resource created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create resource");
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      resourceId,
      data,
    }: {
      subjectId: string;
      resourceId: string;
      data: Partial<any>;
    }) => resourceService.update(subjectId, resourceId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.subjectId] });
      toast.success("Resource updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update resource");
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, resourceId }: { subjectId: string; resourceId: string }) =>
      resourceService.delete(subjectId, resourceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.subjectId] });
      toast.success("Resource deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete resource");
    },
  });
}

export function usePDFUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      data,
    }: {
      file: File;
      data: {
        title: string;
        subject_id: string;
        chapter_id?: string;
        description?: string;
        tags?: string;
        importance?: string;
      };
    }) => pdfService.upload(file, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resources", data.subject_id] });
      toast.success("PDF uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to upload PDF");
    },
  });
}
