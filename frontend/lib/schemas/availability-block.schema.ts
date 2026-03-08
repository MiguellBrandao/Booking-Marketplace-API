import { z } from "zod";

export const availabilityBlockSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(3, "Reason must have at least 3 characters")
      .max(120, "Reason must have at most 120 characters"),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() > new Date(data.startDate).getTime(),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type AvailabilityBlockInput = z.infer<typeof availabilityBlockSchema>;
