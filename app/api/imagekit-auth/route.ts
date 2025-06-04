import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // as using it in backend so from server
import ImageKit from "imagekit";

// Initialize ImageKit with your credentials
// The ImageKit constructor takes an object with three parameters:
// - publicKey: Your ImageKit public API key (used for client-side operations)
// - privateKey: Your ImageKit private API key (used for server-side operations)
// - urlEndpoint: The base URL endpoint for your ImageKit account
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * Handles GET requests to generate ImageKit authentication parameters.
 * 
 * Steps:
 * 1. Authenticates the user using Clerk's `auth()` function.
 *    - If the user is not authenticated (`userId` is falsy), returns a 401 Unauthorized response.
 * 2. If authenticated, calls `imagekit.getAuthenticationParameters()` to generate the parameters
 *    required for client-side uploads (signature, token, expire).
 * 3. Returns these parameters as a JSON response.
 * 4. If any error occurs during the process, logs the error and returns a 500 error response.
 * 
 * Parameters:
 * - None directly, but uses environment variables for ImageKit credentials.
 * - Uses the request context to check authentication.
 */
export async function GET() {
    try {
        // Step 1: Check authentication using Clerk.
        // The `auth()` function returns an object containing the `userId` if authenticated.
        const { userId } = await auth();
        if (!userId) {
            // If not authenticated, return a 401 Unauthorized response.
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Generate ImageKit authentication parameters.
        // `getAuthenticationParameters()` returns an object with signature, token, and expire.
        const authParams = imagekit.getAuthenticationParameters();

        // Step 3: Return the authentication parameters as a JSON response.
        return NextResponse.json(authParams);
    } catch (error) {
        // Step 4: Handle and log any errors, return a 500 error response.
        console.error("Error generating ImageKit auth params:", error);
        return NextResponse.json(
            { error: "Failed to generate authentication parameters" },
            { status: 500 }
        );
    }
}