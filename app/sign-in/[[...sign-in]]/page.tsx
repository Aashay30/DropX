import SignInForm from "@/components/SignInForm";
// import { CloudUpload } from "lucide-react"; // Icon import (currently unused)
// import Link from "next/link"; // Link component from Next.js (currently unused)
import Navbar from "@/components/Navbar";

/**
 * SignInPage Component
 *
 * This component serves as the main layout for the user sign-in page of the DropX application.
 * It includes:
 * - A top navigation bar
 * - A centered sign-in form
 * - A footer with branding and copyright
 *
 * No props are passed to this component as it acts as a standalone page in Next.js.
 *
 * @returns JSX.Element - A complete sign-in page layout
 */
export default function SignInPage() {
  return (
    // Root container that takes up the full height of the viewport
    // Uses a vertical flex layout and a background gradient for light and dark modes
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar component at the top for navigation across the site */}
      <Navbar />

      {/* Main content area:
          - flex-1: expands to fill available vertical space
          - flex, justify-center, items-center: centers the form both vertically and horizontally
          - p-6: padding around the content for spacing on smaller screens
      */}
      <main className="flex-1 flex justify-center items-center p-6">
        {/* Sign-in form component */}
        <SignInForm />
      </main>

      {/* Footer section:
          - bg-gray-900: dark background
          - text-white: white text for contrast
          - py-4: vertical padding
          - Contains a centered text element with current year
      */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          {/* Dynamically shows the current year using JavaScript Date object */}
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} DropX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
