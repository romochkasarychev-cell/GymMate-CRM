import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="gym-page-title break-words">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">{action}</div> : null}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div className={cn("gym-stat-card rounded-xl ring-1 ring-foreground/10", className)}>
      <div className="space-y-2 px-4 pb-4 pt-5">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </p>
        <p className="font-heading text-3xl font-normal tracking-wide sm:text-4xl">{value}</p>
      </div>
    </div>
  );
}
