// Import required modules and types
import { NextRequest, NextResponse } from "next/server"; // Handles HTTP requests/responses in Next.js API routes
import { auth } from "@clerk/nextjs/server"; // Authenticates users via Clerk
import { db } from "@/lib/db"; // Custom database instance configured with Drizzle ORM
import { files } from "@/lib/db/schema"; // Database schema representing 'files' table
import { eq, and } from "drizzle-orm"; // SQL query helpers to build conditions
import ImageKit from "imagekit"; // ImageKit SDK to manage cloud files

// Initialize ImageKit with API credentials from environment variables
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * DELETE handler for removing a specific file from both:
 * 1. The ImageKit cloud (if not a folder)
 * 2. The local database
 *
 * @param request - Next.js HTTP request object
 * @param props - Object containing route parameters. In this case, expects a dynamic `fileId` from the URL.
 *                Example route: DELETE /api/files/[fileId]
 */
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    try {
        // Step 1: Authenticate the user using Clerk
        const { userId } = await auth();
        if (!userId) {
            // Return 401 Unauthorized if user is not logged in
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Extract fileId from dynamic route params
        const { fileId } = await props.params;
        if (!fileId) {
            // Return 400 Bad Request if fileId is missing
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        // Step 3: Query the database for the file that matches the fileId and belongs to the authenticated user
        const [file] = await db
            .select()
            .from(files)
            .where(and(eq(files.id, fileId), eq(files.userId, userId)));

        if (!file) {
            // Return 404 Not Found if no matching file exists
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Step 4: If it's a file (not a folder), attempt to delete it from ImageKit
        if (!file.isFolder) {
            try {
                let imagekitFileId: string | null = null;

                // Extract the file name from fileUrl (removing query params)
                if (file.fileUrl) {
                    const urlWithoutQuery = file.fileUrl.split("?")[0];
                    imagekitFileId = urlWithoutQuery.split("/").pop() || null;
                }

                // Fallback: Try extracting filename from the file path
                if (!imagekitFileId && file.path) {
                    imagekitFileId = file.path.split("/").pop() || null;
                }

                // Step 4.1: If we have an identifier, try deleting from ImageKit
                if (imagekitFileId) {
                    try {
                        // First try to find the file via ImageKit API (search by name)
                        const searchResults = await imagekit.listFiles({
                            name: imagekitFileId,
                            limit: 1,
                        });

                        if (searchResults && searchResults.length > 0) {
                            const found = searchResults[0];
                            // Only delete if the result is a FileObject (has fileId)
                            if ("fileId" in found && typeof found.fileId === "string") {
                                await imagekit.deleteFile(found.fileId);
                            } else {
                                // Otherwise, attempt delete using guessed ID
                                await imagekit.deleteFile(imagekitFileId);
                            }
                        } else {
                            // Otherwise, attempt delete using guessed ID
                            await imagekit.deleteFile(imagekitFileId);
                        }
                    } catch (searchError) {
                        // Fallback: If search fails, attempt direct deletion anyway
                        console.error(`Error searching for file in ImageKit:`, searchError);
                        await imagekit.deleteFile(imagekitFileId);
                    }
                }
            } catch (error) {
                console.error(`Error deleting file ${fileId} from ImageKit:`, error);
                // Note: We don't throw here so DB delete can still proceed
            }
        }

        // Step 5: Delete the file record from the database
        const [deletedFile] = await db
            .delete(files)
            .where(and(eq(files.id, fileId), eq(files.userId, userId)))
            .returning(); // Returns the deleted row

        // Step 6: Return success response with the deleted file details
        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
            deletedFile,
        });
    } catch (error) {
        // Catch any unexpected errors (DB connection, ImageKit failures, etc.)
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
