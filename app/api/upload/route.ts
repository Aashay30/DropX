import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
    // The 'request' parameter is an instance of NextRequest, representing the incoming HTTP request.
    // It provides access to the request body, headers, etc.

    try {
        // Authenticate the user using Clerk's auth() function.
        // Returns an object containing the authenticated user's ID.
        const { userId } = await auth();

        // If no user is authenticated, return a 401 Unauthorized response.
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse the JSON body of the request.
        // Expects an object with 'imagekit' (file info) and 'userId' (the uploader's ID).
        const body = await request.json();
        const { imagekit, userId: bodyUserId } = body;

        // Ensure the user is uploading to their own account by comparing IDs.
        if (bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate that the 'imagekit' object exists and contains a file URL.
        if (!imagekit || !imagekit.url) {
            return NextResponse.json(
                { error: "Invalid file upload data" },
                { status: 400 }
            );
        }

        // Prepare the file data to be saved in the database.
        // Extracts relevant fields from the 'imagekit' object and adds metadata.
        const fileData = {
            name: imagekit.name || "Untitled", // File name or default
            path: imagekit.filePath || `/DropX/${userId}/${imagekit.name}`, // File path or default
            size: imagekit.size || 0, // File size or default
            type: imagekit.fileType || "image", // File type or default
            fileUrl: imagekit.url, // Direct URL to the file
            thumbnailUrl: imagekit.thumbnailUrl || null, // Thumbnail URL if available
            userId: userId, // Owner's user ID
            parentId: null, // No parent folder (root level)
            isFolder: false, // Indicates this is a file, not a folder
            isStarred: false, // Not starred by default
            isTrash: false, // Not in trash by default
        };

        // Insert the new file record into the database.
        // 'db.insert(files).values(fileData).returning()' returns the inserted record.
        const [newFile] = await db.insert(files).values(fileData).returning();

        // Respond with the newly created file record as JSON.
        return NextResponse.json(newFile);
    } catch (error) {
        // If any error occurs, log it and return a 500 Internal Server Error response.
        console.error("Error saving file:", error);
        return NextResponse.json(
            { error: "Failed to save file information" },
            { status: 500 }
        );
    }
}