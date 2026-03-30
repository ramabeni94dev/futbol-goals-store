import { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
