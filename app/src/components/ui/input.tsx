import * as React from "react";
import { cn } from "@/lib/utils";

/** 44px / 16px — Finger auf dem Telefon, kein iOS-Zoom beim Fokus. */
export const fieldControlClassName =
  "flex min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(fieldControlClassName, className)}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
