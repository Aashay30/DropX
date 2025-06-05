"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CloudUpload, ChevronDown, User, Menu, X } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { useState, useEffect, useRef } from "react";

interface SerializedUser {
  /**
   * Represents a simplified user object to display in the navbar.
   *
   * @param id - Unique user identifier.
   * @param firstName - Optional user's first name.
   * @param lastName - Optional user's last name.
   * @param imageUrl - Optional URL to user's profile image.
   * @param username - Optional username string.
   * @param emailAddress - Optional email address string.
   */
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
  emailAddress?: string | null;
}

interface NavbarProps {
  /**
   * The user data to display in the navbar.
   * Optional because the user may be signed out.
   */
  user?: SerializedUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const { signOut } = useClerk(); // Clerk auth hook to trigger sign out
  const router = useRouter(); // Next.js router for client navigation
  const pathname = usePathname(); // Current URL path
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu toggle state
  const [isScrolled, setIsScrolled] = useState(false); // Scroll state for header shadow effect
  const mobileMenuRef = useRef<HTMLDivElement>(null); // Ref for mobile menu container

  /**
   * Determine if the current route is the dashboard or its subroutes.
   * This is used to conditionally render Dashboard button.
   */
  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  /**
   * useEffect: Adds a scroll event listener to the window to detect
   * if the page has been scrolled more than 10px vertically.
   *
   * Updates `isScrolled` state to apply a shadow on navbar when scrolled.
   * Cleans up listener on component unmount.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * useEffect: Adds a resize event listener to window to detect if viewport
   * width is at least 768px (desktop breakpoint).
   *
   * When resizing to desktop, forcibly close mobile menu if it was open.
   * Cleans up listener on unmount.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * useEffect: Locks/unlocks document body scroll when mobile menu opens/closes.
   * This prevents background scrolling when the mobile menu overlay is active.
   * Also cleans up to reset overflow style on unmount or dependency change.
   */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /**
   * useEffect: Listens for clicks outside of the mobile menu to automatically
   * close it when clicking outside the menu area.
   *
   * It checks if the click target is not inside the mobile menu ref and also
   * not on the menu toggle button (which has data-menu-button="true" attribute).
   *
   * Cleans up listener on unmount or when isMobileMenuOpen changes.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-menu-button="true"]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  /**
   * handleSignOut:
   * Function to sign the user out using Clerk's signOut method.
   * After signing out successfully, it redirects to the homepage ("/").
   */
  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  /**
   * Prepare user display details:
   * - fullName: Concatenates first and last name or empty string.
   * - initials: Extracts uppercase initials from first and last name or defaults to "U".
   * - displayName: Shows first+last name or username or email or "User" as fallback.
   * - email: Uses user's email address or empty string.
   */
  const userDetails = {
    fullName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "",
    initials: user
      ? `${user.firstName || ""} ${user.lastName || ""}`
          .trim()
          .split(" ")
          .map((name) => name?.[0] || "")
          .join("")
          .toUpperCase() || "U"
      : "U",
    displayName: user
      ? user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || user.emailAddress || "User"
      : "User",
    email: user?.emailAddress || "",
  };

  /**
   * toggleMobileMenu:
   * Toggles the state controlling mobile menu visibility.
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    // Sticky header bar with shadow effect on scroll
    <header
      className={`bg-default-50 border-b border-default-200 sticky top-0 z-50 transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto py-3 md:py-4 px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo with icon and site name, links to homepage */}
          <Link href="/" className="flex items-center gap-2 z-10">
            <CloudUpload className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">DropX</h1>
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <div className="hidden md:flex gap-4 items-center">
            {/* Show sign-in and sign-up buttons only if user is signed out */}
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="flat" color="primary">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="solid" color="primary">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>

            {/* Show dashboard and user menu if user is signed in */}
            <SignedIn>
              <div className="flex items-center gap-4">
                {/* Dashboard button only if not already on dashboard */}
                {!isOnDashboard && (
                  <Link href="/dashboard">
                    <Button variant="flat" color="primary">
                      Dashboard
                    </Button>
                  </Link>
                )}

                {/* Dropdown user menu */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      className="p-0 bg-transparent min-w-0"
                      endContent={<ChevronDown className="h-4 w-4 ml-2" />}
                    >
                      <div className="flex items-center gap-2">
                        {/* User avatar with fallback icon */}
                        <Avatar
                          name={userDetails.initials}
                          size="sm"
                          src={user?.imageUrl || undefined}
                          className="h-8 w-8 flex-shrink-0"
                          fallback={<User className="h-4 w-4" />}
                        />
                        {/* Display name hidden on very small screens */}
                        <span className="text-default-600 hidden sm:inline">
                          {userDetails.displayName}
                        </span>
                      </div>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User actions">
                    <DropdownItem
                      key="profile"
                      description={userDetails.email || "View your profile"}
                      onClick={() => router.push("/dashboard?tab=profile")}
                    >
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      key="files"
                      description="Manage your files"
                      onClick={() => router.push("/dashboard")}
                    >
                      My Files
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      description="Sign out of your account"
                      className="text-danger"
                      color="danger"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Button and Avatar (visible on mobile only) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Show user avatar if signed in */}
            <SignedIn>
              <Avatar
                name={userDetails.initials}
                size="sm"
                src={user?.imageUrl || undefined}
                className="h-8 w-8 flex-shrink-0"
                fallback={<User className="h-4 w-4" />}
              />
            </SignedIn>

            {/* Toggle button to open/close mobile menu */}
            <button
              className="z-50 p-2"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              data-menu-button="true" // Used to ignore clicks on this button in clickOutside handler
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-default-700" />
              ) : (
                <Menu className="h-6 w-6 text-default-700" />
              )}
            </button>
          </div>

          {/* Mobile menu overlay (semi-transparent backdrop) */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Mobile sliding menu panel */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-default-50 z-40 flex flex-col pt-20 px-6 shadow-xl transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } md:hidden`}
          >
            {/* Show Sign In / Sign Up links when signed out */}
            <SignedOut>
              <div className="flex flex-col gap-4 items-center">
                <Link
                  href="/sign-in"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="flat" color="primary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="solid" color="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SignedOut>

            {/* Show user info and navigation links when signed in */}
            <SignedIn>
              <div className="flex flex-col gap-6">
                {/* User info with avatar, name, and email */}
                <div className="flex items-center gap-3 py-4 border-b border-default-200">
                  <Avatar
                    name={userDetails.initials}
                    size="md"
                    src={user?.imageUrl || undefined}
                    className="h-10 w-10 flex-shrink-0"
                    fallback={<User className="h-5 w-5" />}
                  />
                  <div>
                    <p className="font-medium">{userDetails.displayName}</p>
                    <p className="text-sm text-default-500">
                      {userDetails.email}
                    </p>
                  </div>
                </div>

                {/* Navigation links inside mobile menu */}
                <div className="flex flex-col gap-4">
                  {/* Dashboard link shown if not already on dashboard */}
                  {!isOnDashboard && (
                    <Link
                      href="/dashboard"
                      className="py-2 px-3 hover:bg-default-100 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {/* Profile link */}
                  <Link
                    href="/dashboard?tab=profile"
                    className="py-2 px-3 hover:bg-default-100 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {/* Sign Out button */}
                  <button
                    className="py-2 px-3 text-left text-danger hover:bg-danger-50 rounded-md transition-colors mt-4"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
