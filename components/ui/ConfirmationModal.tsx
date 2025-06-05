import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { LucideIcon } from "lucide-react";

/**
 * Props interface for ConfirmationModal component
 */
interface ConfirmationModalProps {
  /** Controls whether the modal is open or closed */
  isOpen: boolean;

  /**
   * Callback function to update the open state.
   * Typically used to close the modal by passing false.
   * @param isOpen - new open state (true = open, false = closed)
   */
  onOpenChange: (isOpen: boolean) => void;

  /** Title text displayed in the modal header */
  title: string;

  /** Description or message shown inside the modal body */
  description: string;

  /** Optional icon component (Lucide icon) to display alongside the title */
  icon?: LucideIcon;

  /** Tailwind CSS class or custom class to style the icon color */
  iconColor?: string;

  /** Text shown on the confirm button (default is "Confirm") */
  confirmText?: string;

  /** Text shown on the cancel button (default is "Cancel") */
  cancelText?: string;

  /** Color theme for the confirm button; affects button styling */
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";

  /** Callback invoked when the confirm button is clicked */
  onConfirm: () => void;

  /** If true, modal shows an additional warning message indicating a dangerous action */
  isDangerous?: boolean;

  /** Warning message to display when isDangerous is true */
  warningMessage?: string;
}

/**
 * ConfirmationModal
 *
 * A reusable modal dialog component designed to ask users to confirm an action.
 * It supports customization for title, description, icon, button texts, colors,
 * and can optionally display a danger warning when an irreversible action is being confirmed.
 *
 * @param props - ConfirmationModalProps
 * @returns JSX.Element
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, // Controls visibility of modal
  onOpenChange, // Function to toggle modal open state
  title, // Modal header title text
  description, // Modal main content description text
  icon: Icon, // Optional icon component from Lucide icon set
  iconColor = "text-danger", // Default icon color CSS class
  confirmText = "Confirm", // Confirm button label default
  cancelText = "Cancel", // Cancel button label default
  confirmColor = "danger", // Confirm button color variant default
  onConfirm, // Callback triggered when confirming action
  isDangerous = false, // Flag to show warning section
  warningMessage, // Text to show if warning is enabled
}) => {
  return (
    // Modal component from @heroui/modal library, which handles the modal backdrop and open/close state
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur" // Applies a blur effect on the background when modal is open
      classNames={{
        base: "border border-default-200 bg-default-50", // Styles the modal container
        header: "border-b border-default-200", // Styles the modal header bottom border
        footer: "border-t border-default-200", // Styles the modal footer top border
      }}
    >
      {/* Modal content wrapper */}
      <ModalContent>
        {/* Modal header containing optional icon and title */}
        <ModalHeader className="flex gap-2 items-center">
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
          <span>{title}</span>
        </ModalHeader>

        {/* Modal body content */}
        <ModalBody>
          {/* If the action is marked dangerous and a warning message is provided, show warning section */}
          {isDangerous && warningMessage && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                {/* Optionally show icon in warning box */}
                {Icon && (
                  <Icon
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`}
                  />
                )}
                <div>
                  {/* Bold warning title */}
                  <p className="font-medium">This action cannot be undone</p>
                  {/* Additional warning details */}
                  <p className="text-sm mt-1">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}
          {/* Main description text shown below the warning (or directly if no warning) */}
          <p>{description}</p>
        </ModalBody>

        {/* Modal footer containing Cancel and Confirm buttons */}
        <ModalFooter>
          {/* Cancel button, closes the modal without triggering confirm action */}
          <Button
            variant="flat"
            color="default"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>

          {/* Confirm button, triggers the confirm callback and closes the modal */}
          <Button
            color={confirmColor}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            startContent={Icon && <Icon className="h-4 w-4" />}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
