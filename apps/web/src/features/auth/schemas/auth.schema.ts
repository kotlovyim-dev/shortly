import { z } from "zod";

const passwordSchema = z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters");

export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Please enter a valid email address"),
    password: passwordSchema,
});

export const registerSchema = z
    .object({
        name: z
            .string({ required_error: "Name is required" })
            .min(1, "Name is required")
            .max(100, "Name must be at most 100 characters"),
        email: z
            .string({ required_error: "Email is required" })
            .email("Please enter a valid email address"),
        password: passwordSchema,
        confirmPassword: z
            .string({ required_error: "Confirm your password" })
            .min(1, "Confirm your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
