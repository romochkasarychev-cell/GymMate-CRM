import { Badge } from "@/components/ui/badge";
import { workoutLabelLabels } from "@/lib/labels";
import type { WorkoutLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

const workoutLabelStyles: Record<WorkoutLabel, string> = {
  HEAVY: "border-primary/30 bg-primary/15 text-primary",
  MEDIUM: "border-accent/30 bg-accent/15 text-accent-foreground",
  LIGHT: "border-chart-3/30 bg-chart-3/15 text-chart-3",
  CARDIO: "border-chart-2/30 bg-chart-2/15 text-chart-2",
};

type WorkoutLabelBadgeProps = {
  label: WorkoutLabel;
  className?: string;
};

export function WorkoutLabelBadge({ label, className }: WorkoutLabelBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("w-fit font-medium", workoutLabelStyles[label], className)}
    >
      {workoutLabelLabels[label]}
    </Badge>
  );
}
