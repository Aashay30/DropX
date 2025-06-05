"use client"; 
// This directive is necessary for Next.js to treat this as a client component.
// Enables hooks, event listeners, and dynamic interactivity in this component.

import { Folder, FileText } from "lucide-react"; 
// Importing Lucide icons: Folder icon for directories and FileText icon for file types.

import { IKImage } from "imagekitio-next"; 
// IKImage is an ImageKit component used to display optimized images with transformation options.

import type { File as FileType } from "@/lib/db/schema"; 
// TypeScript import: brings in the definition of the FileType to type-check the 'file' prop.

interface FileIconProps {
  file: FileType;
  // The component accepts one prop: 'file' which contains metadata such as
  // isFolder: boolean (true if it's a folder)
  // path: string (used for image path)
  // type: string (MIME type like "image/png", "application/pdf")
  // name: string (used for alt text)
}

export default function FileIcon({ file }: FileIconProps) {
  // This functional React component renders a specific icon or thumbnail
  // depending on the file's MIME type and folder status.

  // Case 1: If the file is a folder, return a blue folder icon.
  if (file.isFolder) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  // Extract the top-level MIME type from file.type (e.g., "image" from "image/png")
  const fileType = file.type.split("/")[0];

  // Handle rendering based on the type of file
  switch (fileType) {
    // Case 2: For image files, return a thumbnail preview using ImageKit
    case "image":
      return (
        <div className="h-12 w-12 relative overflow-hidden rounded">
          <IKImage
            path={file.path} // File path in ImageKit cloud storage
            transformation={[
              {
                height: 48,       // Resize height
                width: 48,        // Resize width
                focus: "auto",    // Automatically determine focus point
                quality: 80,      // Set image quality
                dpr: 2            // Support retina/high-DPI displays
              },
            ]}
            loading="lazy"         // Lazy load the image for performance
            lqip={{ active: true }} // Low-quality image placeholder (progressive loading)
            alt={file.name}         // Accessibility text for screen readers
            style={{
              objectFit: "cover",  // Ensures image fully covers the container
              height: "100%",
              width: "100%",
            }}
          />
        </div>
      );

    // Case 3: For application files (e.g., PDFs, Word docs)
    case "application":
      // Use red icon for PDFs
      if (file.type.includes("pdf")) {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      // Use orange icon for all other application files
      return <FileText className="h-5 w-5 text-orange-500" />;

    // Case 4: For video files, return a purple file icon
    case "video":
      return <FileText className="h-5 w-5 text-purple-500" />;

    // Default: Generic file icon in gray for all other/unknown types
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}
