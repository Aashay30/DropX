import * as z from 'zod';

/**
 * signInSchema
 * Defines validation rules for sign-in form using Zod.
 */
export const signInSchema = z.object({
    /**
     * identifier
     * - Must be a valid email.
     * - Cannot be empty.
     */
    identifier: z
        .string()
        .min(1, { message: 'Email or Username is required' })
        .email({ message: "Please Enter a valid Email" }),

    /**
     * password
     * - Must be at least 8 characters long.
     * - Cannot be empty.
     */
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' }),
});
