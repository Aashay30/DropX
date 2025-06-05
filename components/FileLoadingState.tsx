"use client";

// Importing the Spinner component from the @heroui/spinner package.
// This Spinner is a UI element that visually indicates a loading state.
import { Spinner } from "@heroui/spinner";

/**
 * FileLoadingState Component
 *
 * This is a React functional component that displays a loading spinner
 * along with a message indicating that files are being loaded.
 *
 * It is typically used to inform users that a file-related operation
 * (like uploading or fetching files) is in progress.
 *
 * The component uses utility CSS classes (likely from Tailwind CSS or similar)
 * to center the content both vertically and horizontally and to add padding.
 *
 * @returns JSX.Element - The rendered UI for the loading state.
 */
export default function FileLoadingState() {
  return (
    // Container div with flexbox layout to arrange child elements vertically.
    // justify-center: centers items vertically within the container.
    // items-center: centers items horizontally within the container.
    // py-20: adds vertical padding (top and bottom) of size 20 units for spacing.
    <div className="flex flex-col justify-center items-center py-20">
      {/* Spinner Component:
          - size="lg": sets the spinner to a large size, making it more visible to users.
          - color="primary": applies the primary color styling from the design system,
            ensuring the spinner matches the app's theme.
          This spinner animates to indicate loading or processing activity. */}
      <Spinner size="lg" color="primary" />

      {/* Paragraph element showing a loading message.
          - mt-4: adds margin-top spacing of size 4 units to separate it from the spinner above.
          - text-default-600: applies a default text color shade (likely a medium gray),
            making the text easy to read but visually subtle. */}
      <p className="mt-4 text-default-600">Loading your files...</p>
    </div>
  );
}
