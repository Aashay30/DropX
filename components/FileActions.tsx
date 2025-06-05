"use client";
// Tells Next.js this is a client-side component (important for interactivity).

import { Star, Trash, X, ArrowUpFromLine, Download } from "lucide-react"; // Icon components for various actions.
import { Button } from "@heroui/button"; // Button component from HeroUI.
import type { File as FileType } from "@/lib/db/schema"; // Type definition for a File object from the DB schema.

// Define props the component expects.
interface FileActionsProps {
  file: FileType; // The file item (or folder) for which actions will be displayed.
  onStar: (id: string) => void; // Function to toggle star/unstar for a file.
  onTrash: (id: string) => void; // Function to move file to trash or restore from it.
  onDelete: (file: FileType) => void; // Function to permanently delete the file.
  onDownload: (file: FileType) => void; // Function to handle download.
}

// Main functional component
export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {
  return (
    // Container for the action buttons
    <div className="flex flex-wrap gap-2 justify-end">
      {/* ======= DOWNLOAD BUTTON ======= */}
      {/* Show only for files (not folders) and if not in trash */}
      {!file.isTrash && !file.isFolder && (
        <Button
          variant="flat" // Minimal button style
          size="sm"
          onClick={() => onDownload(file)} // Calls download function with full file object
          className="min-w-0 px-2"
          startContent={<Download className="h-4 w-4" />} // Icon before text
        >
          <span className="hidden sm:inline">Download</span>{" "}
          {/* Hidden on small screens */}
        </Button>
      )}

      {/* ======= STAR / UNSTAR BUTTON ======= */}
      {/* Show for all files/folders except those in trash */}
      {!file.isTrash && (
        <Button
          variant="flat"
          size="sm"
          onClick={() => onStar(file.id)} // Toggles star state via parent function
          className="min-w-0 px-2"
          startContent={
            <Star
              className={`h-4 w-4 ${
                file.isStarred
                  ? "text-yellow-400 fill-current" // Yellow star if starred
                  : "text-gray-400" // Gray outline if not starred
              }`}
            />
          }
        >
          <span className="hidden sm:inline">
            {file.isStarred ? "Unstar" : "Star"}
          </span>
        </Button>
      )}

      {/* ======= TRASH / RESTORE BUTTON ======= */}
      {/* Always shown: functionality toggles between trash and restore */}
      <Button
        variant="flat"
        size="sm"
        onClick={() => onTrash(file.id)} // Trashes or restores based on `isTrash` flag
        className="min-w-0 px-2"
        color={file.isTrash ? "success" : "default"} // Green for restore, default for trash
        startContent={
          file.isTrash ? (
            <ArrowUpFromLine className="h-4 w-4" /> // Restore icon
          ) : (
            <Trash className="h-4 w-4" /> // Trash icon
          )
        }
      >
        <span className="hidden sm:inline">
          {file.isTrash ? "Restore" : "Delete"}
        </span>
      </Button>

      {/* ======= PERMANENT DELETE BUTTON ======= */}
      {/* Only visible when the file is already in trash */}
      {file.isTrash && (
        <Button
          variant="flat"
          size="sm"
          color="danger" // Red button to signal danger (permanent deletion)
          onClick={() => onDelete(file)} // Delete the actual file forever
          className="min-w-0 px-2"
          startContent={<X className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Remove</span>
        </Button>
      )}
    </div>
  );
}
