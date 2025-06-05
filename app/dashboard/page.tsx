import { auth, currentUser } from "@clerk/nextjs/server"; // Clerk server-side helpers to get user info
import { redirect } from "next/navigation"; // Next.js redirect utility for navigation
import DashboardContent from "@/components/DashboardContent"; // Component displaying main dashboard UI
import { CloudUpload } from "lucide-react"; // Icon used in footer branding
import Navbar from "@/components/Navbar"; // Top navigation bar

/**
 * Dashboard Component (Async)
 *
 * This component represents the authenticated dashboard page for the DropX application.
 * It is an asynchronous Server Component in Next.js using the App Router.
 *
 * Responsibilities:
 * - Checks user authentication using Clerk.
 * - Redirects unauthenticated users to the sign-in page.
 * - Fetches current user data.
 * - Serializes user object to avoid passing non-serializable data to child components.
 * - Renders a navbar, dashboard content, and a footer.
 *
 * No props are passed — authentication and data are handled server-side.
 */
export default async function Dashboard() {
  // Retrieve the current authenticated user's ID (null if not authenticated)
  const { userId } = await auth();

  // Get full user object from Clerk (includes name, email, avatar, etc.)
  const user = await currentUser();

  // If user is not authenticated, redirect them to the sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  // Serialize user data to safely pass it into client components (avoids complex object issues)
  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress, // Take first email if available
      }
    : null;

  return (
    // Root container for the dashboard page
    <div className="min-h-screen flex flex-col bg-default-50">
      {/* Navbar at the top, receives serialized user data as prop */}
      <Navbar user={serializedUser} />

      {/* Main dashboard content area centered with padding */}
      <main className="flex-1 container mx-auto py-8 px-6">
        <DashboardContent
          userId={userId}
          userName={
            user?.firstName ||
            user?.fullName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            ""
          }
        />
      </main>

      {/* Footer section with branding and year */}
      <footer className="bg-default-50 border-t border-default-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Branding: Icon + App Name */}
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">DropX</h2>
            </div>

            {/* Dynamic copyright */}
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} DropX
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
