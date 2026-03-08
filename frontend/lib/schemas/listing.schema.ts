import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(3, "Title must have at least 3 characters"),
  description: z.string().min(5, "Description must have at least 5 characters"),
  city: z.string().min(2, "City is required"),
  pricePerNight: z.coerce.number().positive("Price must be greater than zero"),
  currency: z.string().min(3, "Currency is required").max(3, "Use ISO code"),
  status: z.enum(["active", "inactive"]),
});

export type ListingInput = z.infer<typeof listingSchema>;
