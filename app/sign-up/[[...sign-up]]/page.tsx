import SignUpForm from "@/components/SignUpForm";
import { CloudUpload } from "lucide-react"; // Imported but not used in this component
import Link from "next/link"; // Imported but not used in this component
import Navbar from "@/components/Navbar";

/**
 * SignUpPage component
 *
 * This is the main React component for the sign-up page of the application.
 * It organizes the page layout with a Navbar, the SignUpForm component in the center,
 * and a footer with copyright information.
 *
 * No props are passed to this component since it's a page-level component in Next.js.
 *
 * @returns JSX.Element - The full page structure for user sign-up.
 */
export default function SignUpPage() {
  return (
    // Root div sets min-height to full viewport height and uses flexbox for vertical layout.
    // Background gradient is applied with light and dark mode support.
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar component at the top of the page for site navigation */}
      <Navbar />

      {/* Main content area that grows to fill remaining space.
          Uses flexbox to center its content both vertically and horizontally,
          and applies padding around content.
      */}
      <main className="flex-1 flex justify-center items-center p-6">
        {/* SignUpForm component renders the actual sign-up form UI */}
        <SignUpForm />
      </main>

      {/* Footer section styled with dark background and white text.
          It contains centered copyright text.
      */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          {/* Display the current year dynamically */}
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} DropX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
