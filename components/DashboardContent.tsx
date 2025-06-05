"use client";
// This directive tells Next.js to render this component on the client side

import { useState, useCallback, useEffect } from "react"; // React hooks for state and lifecycle handling
import { Card, CardBody, CardHeader } from "@heroui/card"; // UI components from HeroUI
import { Tabs, Tab } from "@heroui/tabs"; // Tabbed navigation components
import { FileUp, FileText, User } from "lucide-react"; // Lucide icons for visuals
import FileUploadForm from "@/components/FileUploadForm"; // Component for file uploads
import FileList from "@/components/FileList"; // Component that lists uploaded files
import UserProfile from "@/components/UserProfile"; // Component that shows user profile
import { useSearchParams } from "next/navigation"; // For reading query parameters like `?tab=profile`

// Define expected props for this component
interface DashboardContentProps {
  userId: string; // Clerk user ID
  userName: string; // Display name of the user
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams(); // Access current URL search parameters
  const tabParam = searchParams.get("tab"); // Get the value of `tab` parameter from the URL

  // Local state to manage UI behavior
  const [activeTab, setActiveTab] = useState<string>("files"); // Track which tab is active
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to refresh the file list after upload
  const [currentFolder, setCurrentFolder] = useState<string | null>(null); // Track currently selected folder

  // When the component mounts or URL param changes, set the default tab accordingly
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  // Callback triggered after successful file upload
  const handleFileUploadSuccess = useCallback(() => {
    // Incrementing this value will force FileList to refetch or re-render
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Callback to update the current folder ID when navigating inside folders
  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  return (
    <>
      {/* Welcome message */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-default-900">
          Hi,{" "}
          <span className="text-primary">
            {userName?.length > 10
              ? `${userName?.substring(0, 10)}...` // Truncate long names
              : userName?.split(" ")[0] || "there"}{" "}
            {/* Use first name or fallback */}
          </span>
          !
        </h2>
        <p className="text-default-600 mt-2 text-lg">
          Your images are waiting for you.
        </p>
      </div>

      {/* Main tab navigation */}
      <Tabs
        aria-label="Dashboard Tabs" // Accessibility label
        color="primary" // Theme color
        variant="underlined" // Visual style
        selectedKey={activeTab} // Currently active tab
        onSelectionChange={(key) => setActiveTab(key as string)} // Handle tab switch
        classNames={{
          tabList: "gap-6", // Styling for tab list
          tab: "py-3", // Padding for each tab
          cursor: "bg-primary", // Cursor style
        }}
      >
        {/* --- My Files Tab --- */}
        <Tab
          key="files"
          title={
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <span className="font-medium">My Files</span>
            </div>
          }
        >
          {/* Upload + File List Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Card */}
            <div className="lg:col-span-1">
              <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex gap-3">
                  <FileUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Upload</h2>
                </CardHeader>
                <CardBody>
                  <FileUploadForm
                    userId={userId} // Pass current user ID to associate uploads
                    onUploadSuccess={handleFileUploadSuccess} // Refresh list on success
                    currentFolder={currentFolder} // Upload to current folder
                  />
                </CardBody>
              </Card>
            </div>

            {/* File List Card */}
            <div className="lg:col-span-2">
              <Card className="border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your Files</h2>
                </CardHeader>
                <CardBody>
                  <FileList
                    userId={userId} // User whose files to display
                    refreshTrigger={refreshTrigger} // Triggers refresh when incremented
                    onFolderChange={handleFolderChange} // Allow FileList to inform about folder changes
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        </Tab>

        {/* --- Profile Tab --- */}
        <Tab
          key="profile"
          title={
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </div>
          }
        >
          {/* Profile Information */}
          <div className="mt-8">
            <UserProfile />
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
