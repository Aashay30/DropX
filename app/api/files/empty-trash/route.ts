import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

// Define DELETE endpoint to permanently delete all files in trash for the logged-in user
export async function DELETE() {
    try {
        // Step 1: Authenticate the user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 2: Fetch all trashed files for this user
        const trashedFiles = await db
            .select()
            .from(files)
            .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

        if (trashedFiles.length === 0) {
            return NextResponse.json(
                { message: "No files in trash" },
                { status: 200 }
            );
        }

        // Step 3: Delete files from ImageKit (skip folders)
        const deletePromises = trashedFiles.map(async (file) => {
            // Narrow the type by checking `isFolder`
            if (file.isFolder) return;

            try {
                let imagekitFileId: string | null = null;

                // Strategy 1: Get file name from fileUrl (e.g., https://.../filename.jpg?query)
                if (file.fileUrl) {
                    const urlWithoutQuery = file.fileUrl.split("?")[0];
                    imagekitFileId = urlWithoutQuery.split("/").pop() || null;
                }

                // Strategy 2: Fallback to extracting from path
                if (!imagekitFileId && file.path) {
                    imagekitFileId = file.path.split("/").pop() || null;
                }

                // Step 4: Use ImageKit SDK to find and delete the file
                if (imagekitFileId) {
                    try {
                        const searchResults = await imagekit.listFiles({
                            name: imagekitFileId,
                            limit: 1,
                        });

                        if (searchResults && searchResults.length > 0 && "fileId" in searchResults[0]) {
                            await imagekit.deleteFile((searchResults[0] as { fileId: string }).fileId);
                        } else {
                            await imagekit.deleteFile(imagekitFileId);
                        }
                    } catch (searchError) {
                        console.error(`Error searching for file:`, searchError);
                        await imagekit.deleteFile(imagekitFileId); // Attempt direct delete
                    }
                }
            } catch (error) {
                console.error(`Error deleting file ${file.id} from ImageKit:`, error);
            }
        });

        // Step 5: Wait for all deletions to finish
        await Promise.allSettled(deletePromises);

        // Step 6: Delete all records from DB
        const deletedFiles = await db
            .delete(files)
            .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
            .returning();

        // Step 7: Respond with success message
        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deletedFiles.length} files from trash`,
        });
    } catch (error) {
        console.error("Error emptying trash:", error);
        return NextResponse.json(
            { error: "Failed to empty trash" },
            { status: 500 }
        );
    }
}
