import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

/**
 * Handles POST requests to create a new folder for the authenticated user.
 * 
 * @param request - NextRequest object representing the incoming HTTP request.
 *                  Used to access the request body and headers.
 * 
 * The function expects the request body to contain:
 *   - name: string (required) - The name of the folder to create.
 *   - userId: string (required) - The ID of the user making the request (should match the authenticated user).
 *   - parentId: string | null (optional) - The ID of the parent folder, if creating a subfolder.
 * 
 * Returns a JSON response indicating success or failure, and the created folder data on success.
 */

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user using Clerk's auth() function.
        // Returns an object containing the authenticated user's ID.
        const { userId } = await auth();

        // If no user is authenticated, return a 401 Unauthorized response.
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse the JSON body of the request.
        // Expects an object with 'name', 'userId', and optionally 'parentId'.
        const body = await request.json();
        const { name, userId: bodyUserId, parentId = null } = body;

        // Verify the user is creating a folder in their own account
        if (bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate that the folder name is provided and is a non-empty string.
        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json(
                { error: "Folder name is required" },
                { status: 400 }
            );
        }

        // Check if parent folder exists if parentId is provided
        // If a parentId is provided, check if the parent folder exists and belongs to the user.
        // Ensures that folders are only created under valid parent folders.
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId), // Parent folder must have the given ID
                        eq(files.userId, userId), // Parent folder must belong to the user
                        eq(files.isFolder, true) // Parent must be a folder, not a file
                    )
                );

            // If the parent folder does not exist, return a 404 error.
            if (!parentFolder) {
                return NextResponse.json(
                    { error: "Parent folder not found" },
                    { status: 404 }
                );
            }
        } 

        // Create folder record in database
        // Prepare the folder data to be inserted into the database.
        // - id: Unique identifier for the folder (generated with uuidv4).
        // - name: The folder's name (trimmed).
        // - path: The folder's path in the system (constructed using userId and a new UUID).
        // - size: Folders have size 0 by default.
        // - type: Set to "folder" to distinguish from files.
        // - fileUrl: Empty string since folders don't have a file URL.
        // - thumbnailUrl: null since folders don't have thumbnails.
        // - userId: The ID of the folder's owner.
        // - parentId: The ID of the parent folder, or null if root.
        // - isFolder: true to indicate this is a folder.
        // - isStarred: false by default.
        // - isTrash: false by default.
        const folderData = {
            id: uuidv4(),
            name: name.trim(),
            path: `/folders/${userId}/${uuidv4()}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId,
            parentId,
            isFolder: true,
            isStarred: false,
            isTrash: false,
        };

        // Insert the new folder record into the database and return the created folder.
        const [newFolder] = await db.insert(files).values(folderData).returning();

        // Respond with a success message and the new folder's data.
        return NextResponse.json({
            success: true,
            message: "Folder created successfully",
            folder: newFolder,
        });
    } catch (error) {
        // If any error occurs, log it and return a 500 Internal Server Error response.
        console.error("Error creating folder:", error);
        return NextResponse.json(
            { error: "Failed to create folder" },
            { status: 500 }
        );
    }
}