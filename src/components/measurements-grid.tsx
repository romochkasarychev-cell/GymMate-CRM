"use client";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMeasurementCm,
  formatMeasurementDelta,
  measurementPairs,
  measurementSingles,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import { getMeasurementDelta } from "@/lib/measurement-metrics";
import type { BodyMeasurements } from "@/lib/types";

type MeasurementsGridProps = {
  measurements: Record<MeasurementFieldKey, number>;
  startMeasurements?: BodyMeasurements;
  editing: { scope: "start" | "current"; key: MeasurementFieldKey } | null;
  saved: { scope: "start" | "current"; key: MeasurementFieldKey } | null;
  scope: "start" | "current";
  draft: string;
  onStartEdit: (key: MeasurementFieldKey) => void;
  onDraftChange: (value: string) => void;
  onSave: (key: MeasurementFieldKey) => void;
  onKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement>,
    key: MeasurementFieldKey,
  ) => void;
  editWarning?: string;
};

function MeasurementCard({
  label,
  value,
  editing,
  saved,
  onStartEdit,
  delta,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  saved: boolean;
  onStartEdit: () => void;
  delta?: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="gap-2 pb-4">
        <CardDescription>{label}</CardDescription>
        {editing ? (
          <div className="py-2">{children}</div>
        ) : (
          <button
            type="button"
            className="w-full space-y-2.5 rounded-lg py-2 text-left transition-colors hover:text-primary"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onStartEdit}
          >
            <CardTitle className="font-heading py-1 text-xl font-normal text-primary sm:text-2xl">
              {value}
            </CardTitle>
            {delta ? (
              <CardDescription className="pt-0.5">{delta}</CardDescription>
            ) : null}
            <CardDescription className="pt-1 text-xs">
              Нажмите, чтобы изменить
            </CardDescription>
            {saved ? <p className="pt-1 text-xs text-primary">Сохранено</p> : null}
          </button>
        )}
      </CardHeader>
    </Card>
  );
}

function formatDeltaHint(
  start: BodyMeasurements,
  current: BodyMeasurements,
  fieldKey: MeasurementFieldKey,
) {
  const delta = getMeasurementDelta(start, current, fieldKey);
  if (delta === null) {
    return null;
  }

  return `${formatMeasurementDelta(delta)} от старта`;
}

export function MeasurementsGrid({
  measurements,
  startMeasurements,
  editing,
  saved,
  scope,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onKeyDown,
  editWarning,
}: MeasurementsGridProps) {
  const showDeltas = scope === "current" && startMeasurements !== undefined;

  function deltaHint(key: MeasurementFieldKey) {
    if (!showDeltas || !startMeasurements) {
      return null;
    }

    return formatDeltaHint(startMeasurements, measurements, key);
  }
  function isEditing(key: MeasurementFieldKey) {
    return editing?.scope === scope && editing.key === key;
  }

  function isSaved(key: MeasurementFieldKey) {
    return saved?.scope === scope && saved.key === key;
  }

  function renderInput(key: MeasurementFieldKey) {
    return (
      <>
        <Input
          autoFocus
          type="number"
          step="0.1"
          min="0"
          inputMode="decimal"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={() => onSave(key)}
          onKeyDown={(event) => onKeyDown(event, key)}
          className="font-heading text-xl sm:text-2xl"
        />
        {editWarning ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">{editWarning}</p>
        ) : null}
        {isSaved(key) ? <p className="text-xs text-primary">Сохранено</p> : null}
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {measurementSingles.map(({ key, label }) => (
          <MeasurementCard
            key={key}
            label={label}
            value={formatMeasurementCm(measurements[key])}
            delta={deltaHint(key)}
            editing={isEditing(key)}
            saved={isSaved(key)}
            onStartEdit={() => onStartEdit(key)}
          >
            {renderInput(key)}
          </MeasurementCard>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {measurementPairs.map((group) => (
          <Card
            key={group.title}
            className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm"
          >
            <CardHeader className="gap-3 pb-4">
              <CardDescription>{group.title}</CardDescription>
              <div className="grid gap-5 sm:grid-cols-2">
                {[group.right, group.left].map((side) => (
                  <div key={side.key} className="space-y-2">
                    <CardDescription>{side.label}</CardDescription>
                    {isEditing(side.key) ? (
                      <div className="py-2">{renderInput(side.key)}</div>
                    ) : (
                      <button
                        type="button"
                        className="w-full space-y-2.5 rounded-lg py-2 text-left transition-colors hover:text-primary"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onStartEdit(side.key)}
                      >
                        <CardTitle className="font-heading py-1 text-xl font-normal text-primary sm:text-2xl">
                          {formatMeasurementCm(measurements[side.key])}
                        </CardTitle>
                        {deltaHint(side.key) ? (
                          <CardDescription className="pt-0.5">
                            {deltaHint(side.key)}
                          </CardDescription>
                        ) : null}
                        <CardDescription className="pt-1 text-xs">
                          Нажмите, чтобы изменить
                        </CardDescription>
                        {isSaved(side.key) ? (
                          <p className="pt-1 text-xs text-primary">Сохранено</p>
                        ) : null}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
