import { z } from "zod";

export const linkModalSchema = z.object({
    originalUrl: z.url("Enter a valid URL including http:// or https://"),
    title: z
        .string()
        .max(120, "Title must be at most 120 characters")
        .optional()
        .or(z.literal("")),
    customSlug: z
        .string()
        .max(64, "Custom slug must be at most 64 characters")
        .regex(
            /^[A-Za-z0-9_-]*$/,
            "Use only letters, numbers, hyphen or underscore",
        )
        .optional()
        .or(z.literal("")),
    expiresAt: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }

                return !Number.isNaN(Date.parse(value));
            },
            {
                message: "Enter a valid expiration date",
            },
        )
        .refine(
            (value) => {
                if (!value) {
                    return true;
                }

                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return selectedDate > today;
            },
            {
                message: "Expiration date must be in the future",
            },
        ),
});

export type LinkModalValues = z.infer<typeof linkModalSchema>;
