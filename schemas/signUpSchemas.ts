import * as z from 'zod';

/**
 * signUpSchema
 * Validates sign-up form fields with:
 * - Email: required, valid email format
 * - Password: required, minimum 8 chars
 * - Password confirmation: required and must match password
 */
export const signUpSchema = z
    .object({
        email: z
            .string()
            .email({ message: "Please Enter a valid Email" })
            .min(1, { message: 'Email is required' }),

        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' }),

        passwordConfirmation: z
            .string()
            .min(1, { message: 'Password confirmation is required' }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation'],
    });
