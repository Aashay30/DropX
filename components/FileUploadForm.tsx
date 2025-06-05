"use client";

import { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Input } from "@heroui/input";
import {
  Upload,
  X,
  FileUp,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import axios from "axios";

interface FileUploadFormProps {
  userId: string; // ID of the current user uploading files/folders
  onUploadSuccess?: () => void; // Optional callback triggered after successful upload or folder creation
  currentFolder?: string | null; // Optional ID of the current folder (to upload inside)
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  // State for the selected file to upload (null if none)
  const [file, setFile] = useState<File | null>(null);

  // Uploading state to indicate whether upload is in progress
  const [uploading, setUploading] = useState(false);

  // Upload progress percentage (0-100)
  const [progress, setProgress] = useState(0);

  // Error message to display validation or upload errors
  const [error, setError] = useState<string | null>(null);

  // Ref to the hidden file input element for programmatic access
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal open state for creating new folders
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  // State to hold the new folder's name entered by the user
  const [folderName, setFolderName] = useState("");

  // Loading state while the folder is being created
  const [creatingFolder, setCreatingFolder] = useState(false);

  /**
   * Handles file selection via the file input element.
   * Validates the file size (limit: 5MB).
   * @param e Change event from input[type="file"]
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Reject files larger than 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  /**
   * Handles file drop event for drag & drop upload.
   * Also validates file size.
   * @param e Drag event on the drop area div
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      // Reject files larger than 5MB
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setFile(droppedFile);
      setError(null);
    }
  };

  /**
   * Prevents default drag over behavior to allow dropping files.
   * @param e Drag over event on drop area div
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * Clears the currently selected file and resets error state.
   * Also resets the file input value.
   */
  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Handles the actual file upload process.
   * Constructs FormData with file and metadata,
   * performs POST request to upload API,
   * tracks upload progress and handles success/error notifications.
   */
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) {
      formData.append("parentId", currentFolder);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Progress callback to update progress state (percentage)
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      // Show success toast notification after upload completes
      addToast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
        color: "success",
      });

      // Clear selected file and input after successful upload
      clearFile();

      // Call external callback if provided, e.g. to refresh file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");

      // Show failure toast notification
      addToast({
        title: "Upload Failed",
        description: "We couldn't upload your file. Please try again.",
        color: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handles creation of a new folder.
   * Validates folder name, calls API to create folder,
   * shows toast notifications for success/failure,
   * and resets modal state.
   */
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      addToast({
        title: "Invalid Folder Name",
        description: "Please enter a valid folder name.",
        color: "danger",
      });
      return;
    }

    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolder,
      });

      // Show success toast
      addToast({
        title: "Folder Created",
        description: `Folder "${folderName}" has been created successfully.`,
        color: "success",
      });

      // Reset folder input and close modal
      setFolderName("");
      setFolderModalOpen(false);

      // Call external callback if provided (e.g., refresh file list)
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error creating folder:", error);

      // Show failure toast
      addToast({
        title: "Folder Creation Failed",
        description: "We couldn't create the folder. Please try again.",
        color: "danger",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Buttons to trigger folder creation modal or open file selector */}
      <div className="flex gap-2 mb-2">
        <Button
          color="primary"
          variant="flat"
          startContent={<FolderPlus className="h-4 w-4" />}
          onClick={() => setFolderModalOpen(true)}
          className="flex-1"
          aria-label="Create New Folder"
        >
          New Folder
        </Button>
        <Button
          color="primary"
          variant="flat"
          startContent={<FileUp className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          aria-label="Add Image File"
        >
          Add Image
        </Button>
      </div>

      {/* File drop area for drag-and-drop or file browsing */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          error
            ? "border-danger/30 bg-danger/5"
            : file
            ? "border-primary/30 bg-primary/5"
            : "border-default-300 hover:border-primary/5"
        }`}
        aria-label="File drop area"
      >
        {!file ? (
          <div className="space-y-3">
            <FileUp className="h-12 w-12 mx-auto text-primary/70" />
            <div>
              <p className="text-default-600">
                Drag and drop your image here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary cursor-pointer font-medium inline bg-transparent border-0 p-0 m-0"
                  aria-label="Browse files"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-default-500 mt-1">Images up to 5MB</p>
            </div>
            {/* Hidden file input for file selection */}
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-default-500">
                    {/* Display file size with appropriate units */}
                    {file.size < 1024
                      ? `${file.size} B`
                      : file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
              </div>
              {/* Button to clear selected file */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={clearFile}
                className="text-default-500"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Show error message if any */}
            {error && (
              <div
                className="bg-danger-5 text-danger-700 p-3 rounded-lg flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Upload progress bar shown during uploading */}
            {uploading && (
              <Progress
                value={progress}
                color="primary"
                size="sm"
                showValueLabel={true}
                className="max-w-full"
                aria-label={`Upload progress: ${progress}%`}
              />
            )}

            {/* Upload button triggers upload, disabled if error */}
            <Button
              color="primary"
              startContent={<Upload className="h-4 w-4" />}
              endContent={!uploading && <ArrowRight className="h-4 w-4" />}
              onClick={handleUpload}
              isLoading={uploading}
              className="w-full"
              isDisabled={!!error}
              aria-disabled={!!error}
            >
              {uploading ? `Uploading... ${progress}%` : "Upload Image"}
            </Button>
          </div>
        )}
      </div>

      {/* Tips section providing guidelines about uploads */}
      <div className="bg-default-100/5 p-4 rounded-lg" aria-live="polite">
        <h4 className="text-sm font-medium mb-2">Tips</h4>
        <ul className="text-xs text-default-600 space-y-1">
          <li>• Images are private and only visible to you</li>
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>

      {/* Modal for creating a new folder */}
      <Modal
        isOpen={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        backdrop="blur"
        classNames={{
          base: "border border-default-200 bg-default-5",
          header: "border-b border-default-200",
          footer: "border-t border-default-200",
        }}
        aria-label="Create new folder"
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span>New Folder</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-default-600">
                Enter a name for your folder:
              </p>
              <Input
                type="text"
                label="Folder Name"
                placeholder="My Images"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
                aria-required="true"
                aria-describedby="folderNameHelp"
              />
              <p id="folderNameHelp" className="text-xs text-default-500">
                Folder name cannot be empty.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="default"
              onClick={() => setFolderModalOpen(false)}
              aria-label="Cancel folder creation"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleCreateFolder}
              isLoading={creatingFolder}
              isDisabled={!folderName.trim()}
              endContent={!creatingFolder && <ArrowRight className="h-4 w-4" />}
              aria-disabled={!folderName.trim()}
              aria-label="Create folder"
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
