// Ensure the file is treated as a Client Component in Next.js
"use client";

// Import types and libraries
import type { ThemeProviderProps } from "next-themes"; // Optional props for theme configuration
import * as React from "react";
import { HeroUIProvider } from "@heroui/system"; // Custom UI system provider
import { useRouter } from "next/navigation"; // Next.js client-side navigation
import { ThemeProvider as NextThemesProvider } from "next-themes"; // Theme support (light/dark)
import { ImageKitProvider } from "imagekitio-next"; // ImageKit context provider for uploads, transformations
import { ToastProvider } from "@heroui/toast"; // Toast notifications
import { createContext, useContext } from "react"; // React context API

// -----------------------------
// Define props type for Providers component
// -----------------------------
export interface ProvidersProps {
  children: React.ReactNode; // Any child React components
  themeProps?: ThemeProviderProps; // Optional theme-related props for NextThemesProvider
}

// -----------------------------
// TypeScript module augmentation for routerOptions (extends types from @react-types/shared)
// -----------------------------
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

// -----------------------------
// Create ImageKitAuthContext
// This context allows any component to use the ImageKit authentication function
// -----------------------------
export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  // Default fallback (never actually used because real implementation is provided in the provider below)
  authenticate: async () => ({ signature: "", token: "", expire: 0 }),
});

// Custom hook for accessing the ImageKitAuthContext easily in child components
export const useImageKitAuth = () => useContext(ImageKitAuthContext);

// -----------------------------
// ImageKit Authentication Function
// Makes a request to the backend API to retrieve authentication details (used for secure uploads)
// -----------------------------
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth"); // Call to custom API route
    const data = await response.json(); // Parse JSON
    return data; // { signature, token, expire }
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

// -----------------------------
// Main Providers Component
// Wraps the app in several context providers (theme, routing, ImageKit, toast, etc.)
// -----------------------------
export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter(); // Get router instance for navigation

  return (
    // Provide HeroUI system-wide navigation handling using Next.js router.push
    <HeroUIProvider navigate={router.push}>
      {/* Provide ImageKit context for file uploads */}
      <ImageKitProvider
        authenticator={authenticator} // Function that provides auth signature/token
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""} // Public API key for ImageKit
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""} // ImageKit URL endpoint
      >
        {/* Provide context with just the authenticate method for use anywhere */}
        <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
          {/* Global toast notification provider placed in top-right */}
          <ToastProvider placement="top-right" />

          {/* Theme provider for dark/light modes */}
          <NextThemesProvider {...themeProps}>
            {children} {/* Render children inside all providers */}
          </NextThemesProvider>
        </ImageKitAuthContext.Provider>
      </ImageKitProvider>
    </HeroUIProvider>
  );
}
