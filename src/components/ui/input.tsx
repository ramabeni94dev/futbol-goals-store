import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl border bg-white/80 px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:bg-white",
        error && "border-rose-400 focus:border-rose-500",
        className,
      )}
      {...props}
    />
  );
});
