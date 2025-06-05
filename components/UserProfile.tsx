"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Badge } from "@heroui/badge";
import { useRouter } from "next/navigation";
import { Mail, User, LogOut, Shield, ArrowRight } from "lucide-react";

/**
 * UserProfile component displays the current user's profile information
 * and manages sign-in/sign-out flows.
 *
 * Uses Clerk's `useUser` hook to get authentication state and user info,
 * and `useClerk` for sign out functionality.
 *
 * Uses Next.js `useRouter` for client-side navigation.
 *
 * UI components come from @heroui design system and lucide-react icons.
 */
export default function UserProfile() {
  // Destructure user state and info from Clerk's hook
  const { isLoaded, isSignedIn, user } = useUser();
  // Destructure signOut function from Clerk for logout
  const { signOut } = useClerk();
  // Next.js router for navigation programmatically
  const router = useRouter();

  // If the user data is still loading, show a loading spinner and message
  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-default-600">Loading your profile...</p>
      </div>
    );
  }

  // If user is not signed in, show guest profile card with sign-in button
  if (!isSignedIn) {
    return (
      <Card className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </CardHeader>
        <Divider />
        <CardBody className="text-center py-10">
          <div className="mb-6">
            {/* Avatar with placeholder name 'Guest' */}
            <Avatar name="Guest" size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-default-500 mt-2">
              Please sign in to access your profile
            </p>
          </div>
          {/* Button navigates user to sign-in page */}
          <Button
            variant="solid"
            color="primary"
            size="lg"
            onClick={() => router.push("/sign-in")}
            className="px-8"
            endContent={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </CardBody>
      </Card>
    );
  }

  // When user is signed in, prepare data for display
  // fullName: combines first and last names, trimming whitespace
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  // email: get the user's primary email address
  const email = user.primaryEmailAddress?.emailAddress || "";

  // initials: first letter of each part of the full name, uppercased
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // userRole: a custom field stored in Clerk's publicMetadata (optional)
  const userRole = user.publicMetadata.role as string | undefined;

  /**
   * Handles sign out:
   * - Calls Clerk's signOut method
   * - After sign out, navigates user back to the homepage
   */
  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  // Render the signed-in user profile card with info and sign-out button
  return (
    <Card className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with icon and title */}
      <CardHeader className="flex gap-3">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">User Profile</h2>
      </CardHeader>
      <Divider />
      <CardBody className="py-6">
        {/* User info section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Show user avatar if imageUrl exists, otherwise initials */}
          {user.imageUrl ? (
            <Avatar
              src={user.imageUrl}
              alt={fullName}
              size="lg"
              className="mb-4 h-24 w-24"
            />
          ) : (
            <Avatar
              name={initials}
              size="lg"
              className="mb-4 h-24 w-24 text-lg"
            />
          )}
          {/* User full name */}
          <h3 className="text-xl font-semibold">{fullName}</h3>
          {/* Show email with mail icon if email addresses exist */}
          {user.emailAddresses && user.emailAddresses.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-default-500">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          {/* Display user role badge if role exists */}
          {userRole && (
            <Badge
              color="primary"
              variant="flat"
              className="mt-3"
              aria-label={`User role: ${userRole}`}
            >
              {userRole}
            </Badge>
          )}
        </div>

        <Divider className="my-4" />

        {/* Account status and email verification status badges */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Account Status</span>
            </div>
            <Badge
              color="success"
              variant="flat"
              aria-label="Account status: Active"
            >
              Active
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="font-medium">Email Verification</span>
            </div>
            <Badge
              color={
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "success"
                  : "warning"
              }
              variant="flat"
              aria-label={`Email verification status: ${
                user.emailAddresses?.[0]?.verification?.status === "verified"
                  ? "Verified"
                  : "Pending"
              }`}
            >
              {user.emailAddresses?.[0]?.verification?.status === "verified"
                ? "Verified"
                : "Pending"}
            </Badge>
          </div>
        </div>
      </CardBody>

      <Divider />

      {/* Footer with Sign Out button */}
      <CardFooter className="flex justify-between">
        <Button
          variant="flat"
          color="danger"
          startContent={<LogOut className="h-4 w-4" />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}
