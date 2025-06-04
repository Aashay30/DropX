"use client"; // Enables React Server Components to use client-side features

import { useState } from "react";
import { useForm } from "react-hook-form"; // For form state management and validation
import { zodResolver } from "@hookform/resolvers/zod"; // Integrates Zod schema validation with react-hook-form
import { useSignUp } from "@clerk/nextjs"; // Clerk hook for sign-up logic
import { useRouter } from "next/navigation"; // Next.js router for navigation
import Link from "next/link";
import { z } from "zod"; // Zod for schema validation
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react"; // Icon components
import { signUpSchema } from "@/schemas/signUpSchema"; // Zod schema for sign-up form

export default function SignUpForm() {
  // Router for navigation after successful sign-up
  const router = useRouter();

  // Clerk sign-up hook: provides signUp object, loading state, and setActive function
  const { signUp, isLoaded, setActive } = useSignUp();

  // Local state for form submission, errors, verification, and password visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks if form is submitting
  const [authError, setAuthError] = useState<string | null>(null); // Stores authentication errors
  const [verifying, setVerifying] = useState(false); // Tracks if user is in email verification step
  const [verificationCode, setVerificationCode] = useState(""); // Stores the entered verification code
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  ); // Stores verification errors
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password visibility

  // Set up react-hook-form with Zod schema validation and default values
  const {
    register, // Registers input fields
    handleSubmit, // Handles form submission
    formState: { errors }, // Contains validation errors
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema), // Use Zod for validation
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  // Handles sign-up form submission
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return; // Wait for Clerk to load

    setIsSubmitting(true); // Set loading state
    setAuthError(null); // Reset previous errors

    try {
      // Create user with Clerk
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // Trigger email verification step
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true); // Switch to verification UI
    } catch (error: any) {
      // Handle and display errors
      console.error("Sign-up error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-up. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Handles email verification code submission
  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      // Attempt to verify email with entered code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        // If verification successful, activate session and redirect
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        // If verification not complete, show error
        console.error("Verification incomplete:", result);
        setVerificationError(
          "Verification could not be completed. Please try again."
        );
      }
    } catch (error: any) {
      // Handle and display verification errors
      console.error("Verification error:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is in verification step, show verification form
  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            {/* We've sent a verification code to your email */}
            We&apos;ve sent a verification code to your email
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {/* Show verification error if any */}
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          {/* Verification code form */}
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Option to resend code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              {/* Didn't receive a code?{" "} */}
              Didn&apos;t receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Main sign-up form UI
  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">
          Create Your Account
        </h1>
        <p className="text-default-500 text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {/* Show authentication error if any */}
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        {/* Sign-up form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
            />
          </div>

          {/* Password field with show/hide toggle */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              Password
            </label>
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

          {/* Confirm password field with show/hide toggle */}
          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-default-900"
            >
              Confirm Password
            </label>
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.passwordConfirmation}
              errorMessage={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
              className="w-full"
            />
          </div>

          {/* Terms and conditions notice */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-default-600">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      {/* Link to sign-in page for existing users */}
      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
