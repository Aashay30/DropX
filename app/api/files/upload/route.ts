// Import necessary modules from Next.js, Clerk, and custom libraries
import { NextRequest, NextResponse } from "next/server"; // For handling API requests and responses
import { auth } from "@clerk/nextjs/server"; // For authenticating the current user session
import { db } from "@/lib/db"; // Your database instance using Drizzle ORM
import { files } from "@/lib/db/schema"; // The DB schema for the 'files' table
import { eq, and } from "drizzle-orm"; // SQL condition helpers

import ImageKit from "imagekit"; // SDK for uploading files to ImageKit
import { v4 as uuidv4 } from "uuid"; // For generating a unique filename

// -------------------------
// 🔧 Initialize ImageKit
// -------------------------
// This sets up the ImageKit SDK with credentials from .env
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

// -------------------------
// 📤 POST API Route Handler
// -------------------------
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user via Clerk
        const { userId } = await auth(); // Retrieves the user ID from session
        if (!userId) {
            // User not logged in
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse form data from the request (multipart/form-data)
        const formData = await request.formData();
        const file = formData.get("file") as File; // The uploaded file
        const formUserId = formData.get("userId") as string; // User ID passed in form for validation
        const parentId = (formData.get("parentId") as string) || null; // Optional parent folder ID

        // 🔐 Verify the file is being uploaded to the correct user's account
        if (formUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 📁 Ensure a file was uploaded
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 📂 If parentId is specified, confirm that parent folder exists and belongs to the user
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),         // Match folder ID
                        eq(files.userId, userId),       // Must belong to current user
                        eq(files.isFolder, true)        // Ensure it's a folder
                    )
                );

            if (!parentFolder) {
                return NextResponse.json(
                    { error: "Parent folder not found" },
                    { status: 404 }
                );
            }
        }

        // 📷 Allow only images and PDFs
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only images and PDF files are supported" },
                { status: 400 }
            );
        }

        // 🧱 Convert the uploaded file to a Buffer (needed by ImageKit SDK)
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        // 🎯 Generate a unique filename for storage while retaining original name
        const originalFilename = file.name;
        const fileExtension = originalFilename.split(".").pop() || ""; // e.g., "png"
        const uniqueFilename = `${uuidv4()}.${fileExtension}`; // e.g., "f37b123e-8da7-42a9.png"

        // 📂 Build path to store in ImageKit based on user's ID and optional parent folder
        const folderPath = parentId
            ? `/DropX/${userId}/folders/${parentId}`
            : `/DropX/${userId}`;

        // ⬆️ Upload file to ImageKit
        const uploadResponse = await imagekit.upload({
            file: fileBuffer,                // File content
            fileName: uniqueFilename,       // Name to store it as
            folder: folderPath,             // Path in ImageKit
            useUniqueFileName: false,       // We already set a unique name using UUID
        });

        // 🧾 Prepare metadata for saving in the database
        const fileData = {
            name: originalFilename,              // Original name of file
            path: uploadResponse.filePath,       // Full path in ImageKit
            size: file.size,                     // File size in bytes
            type: file.type,                     // MIME type (image/png, image/jpeg, etc.)
            fileUrl: uploadResponse.url,         // Public file URL from ImageKit
            thumbnailUrl: uploadResponse.thumbnailUrl || null, // Thumbnail for previews (if any)
            userId: userId,                      // Owner's ID
            parentId: parentId,                  // Optional parent folder ID
            isFolder: false,                     // This is a file, not a folder
            isStarred: false,                    // Default flags (used for UI features)
            isTrash: false,
        };

        // 💾 Insert metadata into the database and return the newly created file record
        /* 
        
        db.insert(...).values(...).returning() returns an array of objects, where each object represents a row that was inserted.

        Even if you insert just one row, the return value is still an array with one item.

        */
        const [newFile] = await db.insert(files).values(fileData).returning();

        // ✅ Respond with the saved file record
        return NextResponse.json(newFile);
    } catch (error) {
        // 🛑 Handle unexpected errors gracefully
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
