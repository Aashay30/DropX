import { cn } from "@/lib/utils";
import React from "react";

/**
 * Props interface for Badge component
 */
export type BadgeProps = {
  /**
   * Content inside the badge.
   * Can be text, icon, or any React node.
   */
  children: React.ReactNode;

  /**
   * Color theme of the badge.
   * Supports these variants:
   * - default: Neutral/default styling
   * - primary: Primary brand color styling
   * - secondary: Secondary accent color styling
   * - success: Indicates success state (usually green)
   * - warning: Indicates warning state (usually yellow/orange)
   * - danger: Indicates error/danger state (usually red)
   *
   * Default: "default"
   */
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";

  /**
   * Visual style variant of the badge.
   * - solid: Background filled with color, white text
   * - flat: Light background tint with darker text
   * - outline: Transparent background with colored border and text
   *
   * Default: "solid"
   */
  variant?: "solid" | "flat" | "outline";

  /**
   * Size of the badge.
   * Controls font size, padding, and border-radius.
   *
   * - sm: Small size (small font, smaller padding)
   * - md: Medium size (default)
   * - lg: Large size (larger font, more padding)
   *
   * Default: "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional CSS classes to customize the badge styling further.
   */
  className?: string;
};

/**
 * Badge component
 *
 * A flexible and customizable UI badge component used to highlight labels,
 * statuses, categories, or tags with different color schemes, variants, and sizes.
 *
 * @param props - BadgeProps combined with standard HTML span attributes
 * @returns JSX.Element
 */
export const Badge = ({
  children, // Content inside the badge
  color = "default", // Color theme (default if not specified)
  variant = "solid", // Style variant (solid if not specified)
  size = "md", // Size variant (medium if not specified)
  className, // Additional CSS class names
  ...props // Other HTML span attributes passed through
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  // Define CSS classes for different color and variant combinations
  const colorStyles = {
    default: {
      solid: "bg-default-500 text-white",
      flat: "bg-default-100 text-default-800",
      outline: "border border-default-300 text-default-800",
    },
    primary: {
      solid: "bg-primary text-white",
      flat: "bg-primary-100 text-primary-800",
      outline: "border border-primary-300 text-primary-800",
    },
    secondary: {
      solid: "bg-secondary text-white",
      flat: "bg-secondary-100 text-secondary-800",
      outline: "border border-secondary-300 text-secondary-800",
    },
    success: {
      solid: "bg-success text-white",
      flat: "bg-success-100 text-success-800",
      outline: "border border-success-300 text-success-800",
    },
    warning: {
      solid: "bg-warning text-white",
      flat: "bg-warning-100 text-warning-800",
      outline: "border border-warning-300 text-warning-800",
    },
    danger: {
      solid: "bg-danger text-white",
      flat: "bg-danger-100 text-danger-800",
      outline: "border border-danger-300 text-danger-800",
    },
  };

  // Define CSS classes for different size variants controlling font, padding, and rounding
  const sizeStyles = {
    sm: "text-xs px-1.5 py-0.5 rounded",
    md: "text-xs px-2 py-1 rounded-md",
    lg: "text-sm px-2.5 py-1 rounded-md",
  };

  return (
    // Render a <span> element styled as a badge with combined classes
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium", // Base styles for alignment and font weight
        colorStyles[color][variant], // Apply color and variant specific styles
        sizeStyles[size], // Apply size specific styles
        className // Apply any additional custom classes passed
      )}
      {...props} // Spread any other span attributes like id, aria-label, etc.
    >
      {children}
    </span>
  );
};

export default Badge;
