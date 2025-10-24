import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar component for user profile display.
 * Provides an image with fallback text (e.g., initials).
 *
 * Usage:
 * <Avatar>
 *   <AvatarImage src="/profile.jpg" alt="User" />
 *   <AvatarFallback>AB</AvatarFallback>
 * </Avatar>
 */

export function Avatar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : null;
}

export function AvatarFallback({ className, children }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center text-sm font-medium text-gray-600",
        className
      )}
    >
      {children}
    </span>
  );
}
