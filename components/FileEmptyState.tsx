"use client";
// Marks this component as a client-side component in Next.js, enabling use of hooks, interactivity, etc.

import { File } from "lucide-react"; // Importing the File icon from Lucide for the visual empty state.
import { Card, CardBody } from "@heroui/card"; // Reusable styled Card components from HeroUI.

interface FileEmptyStateProps {
  activeTab: string; // Prop to determine which tab is currently active (all, starred, trash).
}

// The FileEmptyState component displays a friendly message when a file tab has no content.
export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    // Main container styled as a card with light border and background
    <Card className="border border-default-200 bg-default-50">
      {/* Centered body with vertical padding */}
      <CardBody className="text-center py-16">
        {/* Icon indicating the "no files" state */}
        <File className="h-16 w-16 mx-auto text-primary/50 mb-6" />

        {/* Dynamic title depending on which tab is empty */}
        <h3 className="text-xl font-medium mb-2">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </h3>

        {/* Dynamic description based on tab context */}
        <p className="text-default-500 mt-2 max-w-md mx-auto">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage"}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them"}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed"}
        </p>
      </CardBody>
    </Card>
  );
}
