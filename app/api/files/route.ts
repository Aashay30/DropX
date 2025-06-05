import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Handles GET requests to fetch files and folders for the authenticated user.
 * 
 * @param request - NextRequest object representing the incoming HTTP request.
 *                  Used to access query parameters and authentication.
 * 
 * Query parameters expected:
 *   - userId: string (required) - The ID of the user making the request (must match the authenticated user).
 *   - parentId: string | null (optional) - The ID of the parent folder to fetch files from. If not provided, fetches root-level files.
 * 
 * Returns a JSON response containing the user's files/folders for the specified parent, or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user using Clerk's auth() function.
    // Returns an object containing the authenticated user's ID.
    const { userId } = await auth();

    // If no user is authenticated, return a 401 Unauthorized response.
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters from the request URL.
    // - userId: The ID of the user whose files are being requested.
    // - parentId: The ID of the parent folder (optional).
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get("userId");
    const parentId = searchParams.get("parentId");

    // Ensure the user is only requesting their own files.
    if (!queryUserId || queryUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch files from the database based on whether a parentId is provided.
    let userFiles;
    if (parentId) {
      // If parentId is provided, fetch files/folders within that specific folder.
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), eq(files.parentId, parentId)));
    } else {
      // If parentId is not provided, fetch root-level files/folders (where parentId is null).
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.userId, userId), isNull(files.parentId)));
    }

    // Return the fetched files/folders as a JSON response.
    return NextResponse.json(userFiles);
  } catch (error) {
    // If any error occurs, log it and return a 500 Internal Server Error response.
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}