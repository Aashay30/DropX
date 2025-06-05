// Import Next.js types for request and response handling
import { NextRequest, NextResponse } from "next/server";

// Import Clerk's auth function to authenticate the current user
import { auth } from "@clerk/nextjs/server";

// Import your custom database instance and schema
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";

// Import operators from Drizzle ORM to build SQL-like queries
import { eq, and } from "drizzle-orm";

// Define the PATCH handler for toggling a file's `isTrash` status (soft-delete or restore)
export async function PATCH(
    request: NextRequest, // The incoming HTTP PATCH request
    props: { params: Promise<{ fileId: string }> } // Dynamic route parameter, expected to contain `fileId` (e.g., /api/files/[fileId]/trash)
) {
    try {
        // Step 1: Authenticate the user with Clerk
        const { userId } = await auth(); // Returns current logged-in user's ID (or null)
        if (!userId) {
            // If not logged in, deny access
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Extract fileId from the route parameters
        const { fileId } = await props.params;
        if (!fileId) {
            // If no fileId is provided, return a 400 Bad Request error
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        // Step 3: Look up the file in the database to ensure it exists and belongs to the user
        const [file] = await db
            .select() // SELECT * FROM files ...
            .from(files)
            .where(
                and(
                    eq(files.id, fileId),     // Match the file by its ID
                    eq(files.userId, userId)  // Ensure the file belongs to the currently authenticated user
                )
            );

        if (!file) {
            // If no such file is found, return a 404 Not Found error
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Step 4: Toggle the `isTrash` field
        // If `isTrash` is currently false => set it to true (move to trash)
        // If `isTrash` is currently true => set it to false (restore from trash)
        const [updatedFile] = await db
            .update(files)
            .set({ isTrash: !file.isTrash }) // Toggle boolean value
            .where(
                and(
                    eq(files.id, fileId),     // Ensure correct file
                    eq(files.userId, userId)  // Belongs to current user
                )
            )
            .returning(); // Return the updated row(s) from DB (as an array)

        // Step 5: Set a human-readable message based on the new trash status
        const action = updatedFile.isTrash ? "moved to trash" : "restored";

        // Step 6: Return the updated file along with a custom message in JSON response
        return NextResponse.json({
            ...updatedFile, // Spread all file properties
            message: `File ${action} successfully`, // Add a custom message
        });
    } catch (error) {
        // Step 7: Handle unexpected errors (e.g., DB errors, logic issues)
        console.error("Error updating trash status:", error);
        return NextResponse.json(
            { error: "Failed to update file trash status" },
            { status: 500 }
        );
    }
}
