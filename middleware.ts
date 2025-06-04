// Import necessary functions and types from Clerk and Next.js
import {
    clerkMiddleware,      // Higher-order function to wrap your middleware with Clerk's auth logic
    createRouteMatcher,   // Utility to create a function that matches routes against a list of patterns
    auth,                 // Function to access authentication/session info
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; // Used to send responses or redirects from middleware

// Define which routes are public (accessible without authentication)
// createRouteMatcher returns a function that checks if a given request matches any of these patterns
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// Export the middleware as default, wrapped with Clerk's middleware for authentication
export default clerkMiddleware(
    // The middleware receives two parameters:
    // - auth: a function to get the current user's authentication/session info
    // - request: the Next.js request object
    async (auth, request) => {
        const user = auth(); // Call auth() to get a promise for the user's session info
        const userId = (await user).userId; // Extract userId from the resolved session info
        const url = new URL(request.url);   // Parse the request URL

        // If the user is authenticated, is visiting a public route (but not the homepage),
        // redirect them to the dashboard. This prevents logged-in users from accessing sign-in/up pages.
        if (userId && isPublicRoute(request) && url.pathname !== "/") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // If the route is not public, protect it:
        // - If the user is not authenticated, auth.protect() will redirect to sign-in (browser)
        //   or return 401 Unauthorized (API routes)
        if (!isPublicRoute(request)) {
            await auth.protect();
        }
    }
);

// Configure which routes this middleware should run on
export const config = {
    matcher: [
        // This pattern matches all routes except Next.js internals and static files
        // (unless those files are referenced in search params)
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run middleware for API and trpc routes
        "/(api|trpc)(.*)",
    ],
};

/*
Parameter explanations:

- auth (function): Used to get the current user's authentication/session info. Returns a promise that resolves to an object with userId and other session data.
- request (NextRequest): The incoming HTTP request object from Next.js middleware.

Key functions:

- clerkMiddleware: Wraps your middleware to provide Clerk authentication context.
- createRouteMatcher: Returns a function that checks if a request matches any of the provided route patterns.
- auth.protect(): Ensures the route is protected. If the user is not authenticated, it redirects (for browser requests) or returns 401 (for API requests).

Summary of flow:

1. Check if the route is public.
2. If user is logged in and tries to access a public route (except "/"), redirect to "/dashboard".
3. If the route is not public, enforce authentication with auth.protect().
4. The matcher ensures this middleware only runs for relevant routes.
*/

/* 

🧠 Bonus: What is auth.protect()?
It:

Verifies a valid session

If session is invalid:

Automatically redirects (in browser)

Or returns 401 Unauthorized (for API routes)

Useful in middleware because it’s universal for all routes

*/