"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatPeriodLabel,
  shiftPeriod,
  workoutPeriodLabels,
  type WorkoutPeriod,
  type WorkoutPeriodType,
} from "@/lib/workout-period";
import { cn } from "@/lib/utils";

type WorkoutPeriodControlsProps = {
  period: WorkoutPeriod;
  onPeriodChange: (period: WorkoutPeriod) => void;
};

const periodTypes: WorkoutPeriodType[] = ["week", "month", "year"];

export function WorkoutPeriodControls({
  period,
  onPeriodChange,
}: WorkoutPeriodControlsProps) {
  function setPeriodType(type: WorkoutPeriodType) {
    onPeriodChange({ type, anchor: period.anchor });
  }

  return (
    <div className="space-y-4">
      <nav
        className="flex flex-wrap gap-2"
        aria-label="Период отображения тренировок"
      >
        {periodTypes.map((type) => {
          const active = period.type === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setPeriodType(type)}
              className={cn(
                "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "gym-nav-active"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {workoutPeriodLabels[type]}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Предыдущий период"
          onClick={() => onPeriodChange(shiftPeriod(period, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="text-center text-sm font-medium capitalize">
          {formatPeriodLabel(period)}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Следующий период"
          onClick={() => onPeriodChange(shiftPeriod(period, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
