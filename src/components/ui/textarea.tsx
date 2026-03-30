import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:bg-white",
        error && "border-rose-400 focus:border-rose-500",
        className,
      )}
      {...props}
    />
  );
});
