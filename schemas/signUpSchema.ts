/**
 * Schema for validating user sign-up data using Zod.
 *
 * This schema enforces the following rules:
 * - `email`: Must be a non-empty string and a valid email address format.
 *   - Error messages:
 *     - "Email is required" if empty.
 *     - "Please enter a valid email address" if not a valid email.
 * - `password`: Must be a non-empty string with a minimum length of 8 characters.
 *   - Error messages:
 *     - "Password is required" if empty.
 *     - "Password must be at least 8 characters" if too short.
 * - `passwordConfirmation`: Must be a non-empty string.
 *   - Error message:
 *     - "Please confirm your password" if empty.
 * - Additionally, the schema ensures that `password` and `passwordConfirmation` match.
 *   - Error message:
 *     - "Passwords do not match" if the two fields differ.
 *
 * This schema is intended for use in validating sign-up forms to ensure data integrity and provide user-friendly error messages.
 */

import * as z from "zod";

export const signUpSchema = z
    .object({
        email: z
            .string()
            .min(1, { message: "Email is required" })
            .email({ message: "Please enter a valid email address" }),
        password: z
            .string()
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" }),
        passwordConfirmation: z
            .string()
            .min(1, { message: "Please confirm your password" }),
    })
    // to check if password and passwordConfirmation match
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"],
    });