/**
 * Defines the Zod validation schema for user sign-in credentials.
 * 
 * The schema validates the following fields:
 * - `identifier`: A required string that must be a valid email address. 
 *   This field represents either the user's email or username, but enforces email format validation.
 *   - Minimum length: 1 character (cannot be empty).
 *   - Must be a valid email address.
 *   - Custom error messages are provided for missing or invalid input.
 * 
 * - `password`: A required string representing the user's password.
 *   - Minimum length: 1 character (cannot be empty).
 *   - Must be at least 8 characters long.
 *   - Custom error messages are provided for missing or too-short passwords.
 * 
 * This schema is intended for use in authentication flows to ensure that sign-in form data meets the required criteria before submission or processing.
 */

import * as z from "zod";
export const signInSchema = z.object({
    // as want to work with clerk so identifier makes more sense than email
    identifier: z
        .string()
        .min(1, { message: "Email or username is required" })
        .email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" }),
});