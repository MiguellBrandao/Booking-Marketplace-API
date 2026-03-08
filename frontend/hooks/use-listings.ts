import {
  createListing,
  CreateListingRequest,
  getListing,
  getMyListings,
  updateListing,
  UpdateListingRequest,
} from "@/lib/api/listings";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useListings = () => {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: getMyListings,
  });
}

export const useCreateListing = () => {
  return useMutation({
    mutationFn: (data: CreateListingRequest) => createListing(data),
  });
}

export const useListing = (id?: string) => {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListing(id as string),
    enabled: Boolean(id),
  });
};

export const useUpdateListing = (id: string) => {
  return useMutation({
    mutationFn: (data: UpdateListingRequest) => updateListing(id, data),
  });
};
