// Import required types and utilities from Next.js, Clerk, and your database setup
import { NextRequest, NextResponse } from "next/server"; // For handling request and response
import { auth } from "@clerk/nextjs/server"; // To authenticate the user with Clerk
import { db } from "@/lib/db"; // Your custom database instance
import { files } from "@/lib/db/schema"; // File schema from your Drizzle ORM setup
import { eq, and } from "drizzle-orm"; // Drizzle ORM SQL query operators

// Define the PATCH handler to toggle the "starred" status of a file
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> } // The dynamic route parameter for the file ID (e.g. /api/files/[fileId])
) {
  try {
    // Step 1: Authenticate the user using Clerk
    const { userId } = await auth();
    if (!userId) {
      // If user is not logged in, return 401 Unauthorized
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Extract the `fileId` from the route parameters
    const { fileId } = await props.params;
    if (!fileId) {
      // If no file ID is provided, return 400 Bad Request
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Step 3: Query the database to check if the file exists and belongs to the authenticated user
    const [file] = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.id, fileId),     // Match file ID
          eq(files.userId, userId)  // Ensure the file belongs to the logged-in user
        )
      );

    if (!file) {
      // If file not found, return 404 Not Found
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Step 4: Toggle the `isStarred` field
    const updatedFiles = await db
      .update(files)
      .set({ isStarred: !file.isStarred }) // Toggle true <-> false
      .where(
        and(
          eq(files.id, fileId),     // Match the file ID again
          eq(files.userId, userId)  // Ensure user owns the file
        )
      )
      .returning(); // Return the updated row(s)

    // Step 5: Extract the first updated file from the result array
    const updatedFile = updatedFiles[0];

    // Step 6: Send the updated file as the JSON response
    return NextResponse.json(updatedFile);
  } catch (error) {
    // Step 7: Catch any unexpected errors (e.g., DB errors) and return a 500 status
    console.error("Error starring file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}
