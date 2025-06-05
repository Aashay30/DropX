"use client";

// Importing icons from lucide-react library to visually represent each tab.
import { File, Star, Trash } from "lucide-react";

// Importing Tabs and Tab components from @heroui/tabs package for tab navigation UI.
import { Tabs, Tab } from "@heroui/tabs";

// Importing Badge component from @heroui/badge to display count indicators on tabs.
import { Badge } from "@heroui/badge";

// Importing the File type from the local schema definition to type-check the files prop.
import type { File as FileType } from "@/lib/db/schema";

// Defining the props interface for the FileTabs component.
interface FileTabsProps {
  // activeTab: The currently selected tab key as a string, e.g., "all", "starred", or "trash".
  activeTab: string;

  // onTabChange: Callback function invoked when the user selects a different tab.
  // Receives the key of the newly selected tab as a string.
  onTabChange: (key: string) => void;

  // files: Array of file objects, typed as FileType, representing all files in the system.
  files: FileType[];

  // starredCount: Number representing how many files are marked as starred.
  starredCount: number;

  // trashCount: Number representing how many files are in the trash.
  trashCount: number;
}

/**
 * FileTabs Component
 *
 * Displays a set of three tabs to filter files based on categories:
 * - "All Files" shows all files except those in the trash.
 * - "Starred" shows files that have been marked as starred.
 * - "Trash" shows files that have been deleted/moved to trash.
 *
 * Each tab includes an icon, a label, and a badge showing the count of files in that category.
 *
 * The component is fully controlled via the `activeTab` prop and `onTabChange` callback,
 * enabling the parent component to manage tab selection state.
 *
 * @param activeTab - The currently selected tab key.
 * @param onTabChange - Handler called when the user switches tabs.
 * @param files - Array of all file objects.
 * @param starredCount - Number of starred files.
 * @param trashCount - Number of files in trash.
 * @returns JSX.Element - Rendered tabs UI.
 */
export default function FileTabs({
  activeTab,
  onTabChange,
  files,
  starredCount,
  trashCount,
}: FileTabsProps) {
  return (
    <Tabs
      // Controlled selected tab key based on activeTab prop.
      selectedKey={activeTab}
      // When the user selects a tab, call onTabChange with the new tab key.
      onSelectionChange={(key) => onTabChange(key as string)}
      // Primary color theme for tabs.
      color="primary"
      // Tabs style variant: underlined style highlights the active tab with an underline.
      variant="underlined"
      // Custom class names to style the tabs container and elements.
      classNames={{
        base: "w-full overflow-x-auto", // Full width and horizontal scroll if tabs overflow.
        tabList: "gap-2 sm:gap-4 md:gap-6 flex-nowrap min-w-full", // Spacing between tabs and no wrapping.
        tab: "py-3 whitespace-nowrap", // Vertical padding and prevent tab text from wrapping.
        cursor: "bg-primary", // Cursor style when hovering over tabs (background color primary).
      }}
    >
      {/* "All Files" Tab */}
      <Tab
        key="all"
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            {/* File icon with responsive sizing */}
            <File className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Label for the tab */}
            <span className="font-medium">All Files</span>

            {/* Badge showing the count of all files excluding those in trash */}
            <Badge
              variant="flat" // Flat style badge with no background fill.
              color="default" // Default color scheme for badge.
              size="sm" // Small size badge.
              aria-label={`${
                files.filter((file) => !file.isTrash).length
              } files`} // Accessibility label describing badge content.
            >
              {files.filter((file) => !file.isTrash).length}
            </Badge>
          </div>
        }
      />

      {/* "Starred" Tab */}
      <Tab
        key="starred"
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Star icon with responsive sizing */}
            <Star className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Label */}
            <span className="font-medium">Starred</span>

            {/* Badge showing the count of starred files */}
            <Badge
              variant="flat" // Flat style badge.
              color="warning" // Warning color to draw attention.
              size="sm"
              aria-label={`${starredCount} starred files`} // Accessibility label.
            >
              {starredCount}
            </Badge>
          </div>
        }
      />

      {/* "Trash" Tab */}
      <Tab
        key="trash"
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Trash icon with responsive sizing */}
            <Trash className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Label */}
            <span className="font-medium">Trash</span>

            {/* Badge showing the count of files in trash */}
            <Badge
              variant="solid" // Solid badge with background fill.
              color="danger" // Danger color (usually red) indicating deleted files.
              size="sm"
              aria-label={`${trashCount} files in trash`} // Accessibility label.
            >
              {trashCount}
            </Badge>
          </div>
        }
      />
    </Tabs>
  );
}
