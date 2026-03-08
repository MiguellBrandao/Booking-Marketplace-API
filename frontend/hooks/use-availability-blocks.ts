import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AvailabilityBlockRequest,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
  updateAvailabilityBlock,
  UpdateAvailabilityBlockRequest,
} from "@/lib/api/availability-blocks";

export function useAvailabilityBlocks(listingId?: string) {
  return useQuery({
    queryKey: ["availability-blocks", listingId],
    queryFn: () => getAvailabilityBlocks(listingId as string),
    enabled: Boolean(listingId),
  });
}

export function useCreateAvailabilityBlock(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AvailabilityBlockRequest, "listingId">) =>
      createAvailabilityBlock({ ...data, listingId: Number(listingId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability-blocks", listingId],
      });
    },
  });
}

export function useUpdateAvailabilityBlock(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateAvailabilityBlockRequest }) =>
      updateAvailabilityBlock(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability-blocks", listingId],
      });
    },
  });
}

export function useDeleteAvailabilityBlock(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAvailabilityBlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability-blocks", listingId],
      });
    },
  });
}
