import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name too short"),
    email: z.string().email("Invalid Email"),
    password: z.string().min(8, "Must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8, "Must be at least 8 characters long."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
