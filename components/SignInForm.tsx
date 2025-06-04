"use client"; // Indicates this is a client-side component in Next.js (app directory).

import { useState } from "react"; // React hook for managing local state.
import { useForm } from "react-hook-form"; // Library for form state management and validation.
import { zodResolver } from "@hookform/resolvers/zod"; // Integrates Zod schema validation with react-hook-form.
import { useSignIn } from "@clerk/nextjs"; // Clerk authentication hook for sign-in functionality.
import { useRouter } from "next/navigation"; // Next.js hook for client-side navigation.
import Link from "next/link"; // Next.js component for client-side navigation links.
import { z } from "zod"; // Zod library for schema validation.
import { Button } from "@heroui/button"; // UI library button component.
import { Input } from "@heroui/input"; // UI library input component.
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card"; // UI library card components.
import { Divider } from "@heroui/divider"; // UI library divider component.
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"; // Icon components.
import { signInSchema } from "@/schemas/signInSchema"; // Zod schema for sign-in form validation.

export default function SignInForm() {
    // Next.js router for navigation
    const router = useRouter();

    // Clerk sign-in hook: provides signIn function, isLoaded state, and setActive function
    const { signIn, isLoaded, setActive } = useSignIn();

    // Local state for loading, error messages, and password visibility
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // React Hook Form setup with Zod schema validation
    const {
        register, // Registers input fields for form state
        handleSubmit, // Handles form submission
        formState: { errors }, // Contains validation errors
    } = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema), // Uses Zod schema for validation
        defaultValues: {
            identifier: "", // Default email/username value
            password: "",   // Default password value
        },
    });

    // Handles form submission
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        if (!isLoaded) return; // Prevents submission if Clerk is not loaded

        setIsSubmitting(true); // Sets loading state
        setAuthError(null);    // Clears previous errors

        try {
            // Attempts to sign in with Clerk
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            });

            if (result.status === "complete") {
                // If sign-in is successful, set active session and redirect
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                // Handles incomplete sign-in
                console.error("Sign-in incomplete:", result);
                setAuthError("Sign-in could not be completed. Please try again.");
            }
        } catch (error: any) {
            // Handles errors from Clerk
            console.error("Sign-in error:", error);
            setAuthError(
                error.errors?.[0]?.message ||
                    "An error occurred during sign-in. Please try again."
            );
        } finally {
            setIsSubmitting(false); // Resets loading state
        }
    };

    // JSX for the sign-in form UI
    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            {/* Card header with title and subtitle */}
            <CardHeader className="flex flex-col gap-1 items-center pb-2">
                <h1 className="text-2xl font-bold text-default-900">Welcome Back</h1>
                <p className="text-default-500 text-center">
                    Sign in to access your secure cloud storage
                </p>
            </CardHeader>

            <Divider />

            <CardBody className="py-6">
                {/* Displays authentication error if present */}
                {authError && (
                    <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                {/* Sign-in form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email input field */}
                    <div className="space-y-2">
                        <label
                            htmlFor="identifier"
                            className="text-sm font-medium text-default-900"
                        >
                            Email
                        </label>
                        <Input
                            id="identifier"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.identifier}
                            errorMessage={errors.identifier?.message}
                            {...register("identifier")}
                            className="w-full"
                        />
                    </div>

                    {/* Password input field with show/hide toggle */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-default-900"
                            >
                                Password
                            </label>
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-default-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-default-500" />
                                    )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    {/* Submit button with loading state */}
                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </CardBody>

            <Divider />

            {/* Footer with link to sign-up page */}
            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                    {/* Don't have an account?{" "} */}
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}