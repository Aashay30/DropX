"use client";

import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@heroui/button";

interface FolderNavigationProps {
  /**
   * folderPath: An array representing the current folder hierarchy path.
   * Each element is an object with `id` and `name` properties.
   * Example: [{id: "1", name: "Documents"}, {id: "2", name: "Projects"}]
   */
  folderPath: Array<{ id: string; name: string }>;

  /**
   * navigateUp: Function invoked when user wants to navigate one level up
   * in the folder hierarchy. Typically removes the last folder from path.
   */
  navigateUp: () => void;

  /**
   * navigateToPathFolder: Function invoked when user clicks on any folder
   * in the breadcrumb path to directly jump to that folder.
   * It receives the index of the folder clicked in the folderPath array.
   * If index is -1, it means navigate to "Home" (root level).
   */
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    // Container for the breadcrumb navigation bar
    // Uses flexbox with wrap to support responsive layouts,
    // gap for spacing, and overflow-x-auto for horizontal scrolling
    <div className="flex flex-wrap items-center gap-2 text-sm overflow-x-auto pb-2">
      {/* 
        Button to navigate up one level in folder hierarchy 
        Disabled if folderPath is empty (already at root)
        Shows an icon (arrow up) only 
      */}
      <Button
        variant="flat"
        size="sm"
        isIconOnly
        onClick={navigateUp}
        isDisabled={folderPath.length === 0}
      >
        <ArrowUpFromLine className="h-4 w-4" />
      </Button>

      {/* 
        "Home" button navigates to root directory 
        Clicking this calls navigateToPathFolder with -1 
        The text is bolded if folderPath is empty (already home)
      */}
      <Button
        variant="flat"
        size="sm"
        onClick={() => navigateToPathFolder(-1)}
        className={folderPath.length === 0 ? "font-bold" : ""}
      >
        Home
      </Button>

      {/* 
        Map over each folder in the current path to display breadcrumbs.
        For each folder:
          - Show a slash ("/") separator
          - Show a button with folder name 
          - Clicking button navigates to that folder via navigateToPathFolder(index)
          - The last folder (current folder) is bolded to indicate active location
          - Folder name buttons have truncation styles to handle overflow text 
          - title attribute shows full folder name on hover for accessibility
      */}
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-default-400">/</span>
          <Button
            variant="flat"
            size="sm"
            onClick={() => navigateToPathFolder(index)}
            className={`${
              index === folderPath.length - 1 ? "font-bold" : ""
            } text-ellipsis overflow-hidden max-w-[150px]`}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
