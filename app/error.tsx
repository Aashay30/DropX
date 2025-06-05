"use client"; // Enables this file to run as a Client Component in Next.js (needed for hooks like useEffect)

import { useEffect } from "react";

/**
 * Error Boundary Fallback Component
 *
 * This component is used as the default error boundary UI in a Next.js App Router project.
 * It displays a fallback UI when an error is caught during rendering, in a Server or Client Component.
 *
 * It allows users to retry rendering by calling the `reset` function passed to it by Next.js.
 *
 * Props:
 * - error (Error): The actual error object that was thrown.
 * - reset (function): A callback function provided by Next.js to reset the error boundary and retry rendering.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error; // The thrown error object (contains stack trace, message, etc.)
  reset: () => void; // Function to call to "try again" and re-render the failed component tree
}) {
  useEffect(() => {
    // Log the error to console when the component mounts or when the error changes.
    // This is useful for debugging and integrating with logging tools like Sentry, LogRocket, etc.
    /* eslint-disable no-console */
    console.error(error);
  }, [error]); // Dependency array ensures effect runs when the `error` changes

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-red-50">
      {/* User-friendly fallback message */}
      <h2 className="text-2xl font-bold text-red-700 mb-4">
        Something went wrong!
      </h2>

      {/* Retry button to reattempt rendering the segment */}
      <button
        onClick={() => reset()} // Calls the reset function to attempt recovery
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
