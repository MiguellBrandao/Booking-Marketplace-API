import { apiFetch } from "./client";

export type ListingResponse = {
    id: number;
    title: string;
    description: string;
    city: string;
    pricePerNight: number;
    currency: string;
    status: "active" | "inactive";
}

export type CreateListingRequest = {
    title: string;
    description: string;
    city: string;
    pricePerNight: number;
    currency: string;
    status: "active" | "inactive";
}

export type UpdateListingRequest = Partial<CreateListingRequest>;

export function getMyListings() {
    return apiFetch<ListingResponse[]>("/listings/my", {
      method: "GET",
    }, true);
}

export function getListing(id: string | number) {
    return apiFetch<ListingResponse>(`/listings/${id}`, {
      method: "GET",
    }, true);
}

export function createListing(data: CreateListingRequest) {
    return apiFetch<ListingResponse>("/listings", {
      method: "POST",
      body: JSON.stringify(data),
    }, true);
}

export function updateListing(id: string | number, data: UpdateListingRequest) {
    return apiFetch<ListingResponse>(`/listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true);
}
