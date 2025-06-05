"use client";
// This tells Next.js that this component should run on the client-side only

import { RefreshCw, Trash } from "lucide-react"; // Import Lucide icons for refresh and delete
import { Button } from "@heroui/button"; // Button component from HeroUI

// Define the type of props that the FileActionButtons component accepts
interface FileActionButtonsProps {
  activeTab: string; // Currently active tab: can be "all", "starred", or "trash"
  trashCount: number; // Number of items in trash – used to conditionally show "Empty Trash" button
  folderPath: Array<{ id: string; name: string }>; // Breadcrumb-like array to show current folder
  onRefresh: () => void; // Callback function to handle refresh action
  onEmptyTrash: () => void; // Callback function to empty the trash
}

// Functional React component definition
export default function FileActionButtons({
  activeTab,
  trashCount,
  folderPath,
  onRefresh,
  onEmptyTrash,
}: FileActionButtonsProps) {
  return (
    // Layout for buttons and heading
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      {/* Section title: adjusts based on active tab */}
      <h2 className="text-xl sm:text-2xl font-semibold truncate max-w-full">
        {/* Show folder name if in 'all' tab */}
        {activeTab === "all" &&
          (folderPath.length > 0
            ? folderPath[folderPath.length - 1].name // Show name of the current (deepest) folder
            : "All Files")}
        {/* Fallback if no folder path is available */}

        {/* Show 'Starred Files' when in starred tab */}
        {activeTab === "starred" && "Starred Files"}

        {/* Show 'Trash' title when in trash tab */}
        {activeTab === "trash" && "Trash"}
      </h2>

      {/* Action buttons section – Refresh and conditionally Empty Trash */}
      <div className="flex gap-2 sm:gap-3 self-end sm:self-auto">
        {/* Refresh Button: always visible */}
        <Button
          variant="flat" // UI style (flat = minimal background)
          size="sm"
          onClick={onRefresh} // When clicked, call the provided refresh handler
          startContent={<RefreshCw className="h-4 w-4" />} // Add refresh icon before label
        >
          Refresh
        </Button>

        {/* Empty Trash Button: shown only if on trash tab and trash is not empty */}
        {activeTab === "trash" && trashCount > 0 && (
          <Button
            color="danger" // Red colored button to indicate a destructive action
            variant="flat"
            size="sm"
            onClick={onEmptyTrash} // Call the provided empty trash handler
            startContent={<Trash className="h-4 w-4" />} // Add trash icon before label
          >
            Empty Trash
          </Button>
        )}
      </div>
    </div>
  );
}
