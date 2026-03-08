import { apiFetch } from "./client";

export type AvailabilityBlockResponse = {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  listing: {
    id: number;
  };
};

export type AvailabilityBlockRequest = {
  listingId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

export type UpdateAvailabilityBlockRequest = {
  startDate?: string;
  endDate?: string;
  reason?: string;
};

export function getAvailabilityBlocks(listingId: number | string) {
  return apiFetch<AvailabilityBlockResponse[]>(
    `/availabilityblocks?listingId=${listingId}`,
    { method: "GET" },
    true,
  );
}

export function createAvailabilityBlock(data: AvailabilityBlockRequest) {
  return apiFetch<AvailabilityBlockResponse>(
    "/availabilityblocks",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
  );
}

export function updateAvailabilityBlock(
  id: number | string,
  data: UpdateAvailabilityBlockRequest,
) {
  return apiFetch<AvailabilityBlockResponse>(
    `/availabilityblocks/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    true,
  );
}

export function deleteAvailabilityBlock(id: number | string) {
  return apiFetch<{ ok?: boolean }>(
    `/availabilityblocks/${id}`,
    { method: "DELETE" },
    true,
  );
}
