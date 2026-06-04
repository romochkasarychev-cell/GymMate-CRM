"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MeasurementsGrid } from "@/components/measurements-grid";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  applyGymmateProfile,
  reloadGymmateStore,
  retryGymmateStoreLoad,
  useGymmateStore,
  useGymmateStoreError,
  useGymmateStoreLoading,
} from "@/hooks/use-gymmate-store";
import { isApiEnabled } from "@/lib/gymmate-api";
import { updateProfile } from "@/lib/gymmate-storage";
import { goalLabels } from "@/lib/labels";
import {
  measurementFieldLabels,
  parseMeasurementCm,
  patchCurrentMeasurement,
  patchStartMeasurement,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import type { Goal, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

type EditableField =
  | "name"
  | "lastName"
  | "phone"
  | "startWeight"
  | "currentWeight"
  | "goal";

type MeasurementEditTarget = {
  scope: "start" | "current";
  key: MeasurementFieldKey;
};

type ProfileTab = "general" | "start" | "current";

const profileTabs: { id: ProfileTab; label: string; description: string }[] = [
  {
    id: "general",
    label: "Общая информация",
    description: "Контактные данные и цель тренировок",
  },
  {
    id: "start",
    label: "Стартовые значения",
    description: "Точка отсчёта для веса и объёмов тела",
  },
  {
    id: "current",
    label: "Текущие значения",
    description: "Актуальные показатели; при изменении сохраняется последнее значение за день",
  },
];

type ProfileFieldProps = {
  label: string;
  value: string;
  editable?: boolean;
  editing: boolean;
  onStartEdit: () => void;
  children?: React.ReactNode;
  valueClassName?: string;
  hint?: string;
};

function ProfileField({
  label,
  value,
  editable = true,
  editing,
  onStartEdit,
  children,
  valueClassName,
  hint,
}: ProfileFieldProps) {
  return (
    <Card
      className={cn(
        "gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm",
        editable && !editing && "cursor-pointer hover:border-primary/40",
      )}
      onClick={editable && !editing ? onStartEdit : undefined}
      onKeyDown={
        editable && !editing
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onStartEdit();
              }
            }
          : undefined
      }
      role={editable ? "button" : undefined}
      tabIndex={editable && !editing ? 0 : undefined}
    >
      <CardHeader className="gap-2 pb-4">
        <CardDescription>{label}</CardDescription>
        {editing && children ? (
          <div className="py-2">{children}</div>
        ) : (
          <div className="space-y-2.5 py-2">
            <CardTitle
              className={cn(
                "font-heading py-1 text-xl font-normal text-foreground sm:text-2xl",
                valueClassName,
              )}
            >
              {value}
            </CardTitle>
            {hint ? <CardDescription className="pt-0.5">{hint}</CardDescription> : null}
            {editable ? (
              <CardDescription className="pt-1 text-xs">
                Нажмите, чтобы изменить
              </CardDescription>
            ) : null}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

export function ProfileView() {
  const { profile } = useGymmateStore();
  const loading = useGymmateStoreLoading();
  const loadError = useGymmateStoreError();
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editingMeasurement, setEditingMeasurement] =
    useState<MeasurementEditTarget | null>(null);
  const [draft, setDraft] = useState("");
  const [savedField, setSavedField] = useState<EditableField | null>(null);
  const [savedMeasurement, setSavedMeasurement] =
    useState<MeasurementEditTarget | null>(null);
  const [startWeightWarningOpen, setStartWeightWarningOpen] = useState(false);
  const [startMeasurementWarning, setStartMeasurementWarning] =
    useState<MeasurementFieldKey | null>(null);

  const weightDelta = profile.currentWeight - profile.startWeight;
  const deltaLabel =
    weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1);

  function startEdit(field: EditableField, value: string) {
    setEditingField(field);
    setEditingMeasurement(null);
    setDraft(value);
    setSavedField(null);
    setSavedMeasurement(null);
  }

  function startMeasurementEdit(scope: "start" | "current", key: MeasurementFieldKey) {
    const measurements =
      scope === "start" ? profile.startMeasurements : profile.currentMeasurements;

    setEditingMeasurement({ scope, key });
    setEditingField(null);
    setDraft(measurements[key] > 0 ? String(measurements[key]) : "");
    setSavedField(null);
    setSavedMeasurement(null);
  }

  function cancelEdit() {
    setEditingField(null);
    setEditingMeasurement(null);
    setDraft("");
  }

  function switchTab(tab: ProfileTab) {
    if (tab === activeTab) return;
    cancelEdit();
    setStartWeightWarningOpen(false);
    setStartMeasurementWarning(null);
    setActiveTab(tab);
  }

  const activeTabMeta = profileTabs.find((tab) => tab.id === activeTab)!;

  function markSaved(field: EditableField) {
    setSavedField(field);
    window.setTimeout(() => {
      setSavedField((current) => (current === field ? null : current));
    }, 2000);
  }

  function markMeasurementSaved(target: MeasurementEditTarget) {
    setSavedMeasurement(target);
    window.setTimeout(() => {
      setSavedMeasurement((current) =>
        current?.scope === target.scope && current.key === target.key
          ? null
          : current,
      );
    }, 2000);
  }

  async function persistProfile(
    nextProfile: Profile,
    options: Parameters<typeof updateProfile>[1] = {},
  ) {
    const updated = await updateProfile(nextProfile, options);
    if (updated) {
      applyGymmateProfile(updated);
    }
    await reloadGymmateStore();
  }

  function saveProfile(nextProfile: Profile, field: EditableField) {
    void (async () => {
      await persistProfile(nextProfile);
      setEditingField(null);
      setDraft("");
      markSaved(field);
    })();
  }

  function saveCurrentWeight() {
    const currentWeight = Number.parseFloat(draft);
    if (!Number.isFinite(currentWeight) || currentWeight <= 0) return;
    if (currentWeight === profile.currentWeight) {
      cancelEdit();
      return;
    }

    void (async () => {
      await persistProfile(
        { ...profile, currentWeight },
        { previousWeight: profile.currentWeight },
      );
      setEditingField(null);
      setDraft("");
      markSaved("currentWeight");
    })();
  }

  function requestStartWeightEdit() {
    setStartWeightWarningOpen(true);
  }

  function confirmStartWeightEdit() {
    setStartWeightWarningOpen(false);
    startEdit("startWeight", String(profile.startWeight));
  }

  function requestStartMeasurementEdit(key: MeasurementFieldKey) {
    setStartMeasurementWarning(key);
  }

  function confirmStartMeasurementEdit() {
    if (!startMeasurementWarning) return;

    const key = startMeasurementWarning;
    setStartMeasurementWarning(null);
    startMeasurementEdit("start", key);
  }

  function saveName() {
    const name = draft.trim();
    if (!name) return;
    saveProfile({ ...profile, name }, "name");
  }

  function saveLastName() {
    const lastName = draft.trim();
    if (!lastName) return;
    saveProfile({ ...profile, lastName }, "lastName");
  }

  function savePhone() {
    const phone = draft.trim();
    if (!phone) return;
    saveProfile({ ...profile, phone }, "phone");
  }

  function saveStartWeight() {
    const startWeight = Number.parseFloat(draft);
    if (!Number.isFinite(startWeight) || startWeight <= 0) return;
    if (startWeight === profile.startWeight) {
      cancelEdit();
      return;
    }

    void (async () => {
      await persistProfile(
        { ...profile, startWeight },
        { previousStartWeight: profile.startWeight },
      );
      setEditingField(null);
      setDraft("");
      markSaved("startWeight");
    })();
  }

  function saveGoal(goal: Goal) {
    saveProfile({ ...profile, goal }, "goal");
  }

  function saveMeasurement(scope: "start" | "current", field: MeasurementFieldKey) {
    const trimmed = draft.trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }

    const value = parseMeasurementCm(trimmed);
    if (value === null) return;

    const measurements =
      scope === "start" ? profile.startMeasurements : profile.currentMeasurements;
    const previousValue = measurements[field];

    if (value === previousValue) {
      cancelEdit();
      return;
    }

    const nextProfile =
      scope === "start"
        ? patchStartMeasurement(profile, field, value)
        : patchCurrentMeasurement(profile, field, value);

    void (async () => {
      try {
        await persistProfile(nextProfile, {
          ...(scope === "start"
            ? {
                previousStartMeasurement: {
                  key: field,
                  value: previousValue,
                },
              }
            : {
                previousCurrentMeasurement: {
                  key: field,
                  value: previousValue,
                },
              }),
        });
        cancelEdit();
        markMeasurementSaved({ scope, key: field });
      } catch (error) {
        console.error("Failed to save measurement:", error);
      }
    })();
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    onSave: () => void,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      onSave();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  function renderWeightInput(onSave: () => void, saved: boolean) {
    return (
      <>
        <Input
          autoFocus
          type="number"
          step="0.1"
          min="1"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={onSave}
          onKeyDown={(event) => handleInputKeyDown(event, onSave)}
          className="font-heading text-xl sm:text-2xl"
        />
        {saved ? <p className="text-xs text-primary">Сохранено</p> : null}
      </>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Личный кабинет"
        description="Профиль, стартовые и текущие показатели"
      />

      {loading && !profile.name ? (
        <p className="text-sm text-muted-foreground">Загрузка профиля…</p>
      ) : loadError && !profile.name ? (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Не удалось загрузить профиль: {loadError}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={retryGymmateStoreLoad}>
            Повторить
          </Button>
        </div>
      ) : (
        <>
      <div className="space-y-6">
        <nav
          className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
          aria-label="Разделы личного кабинета"
        >
          {profileTabs.map(({ id, label }) => {
            const active = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={cn(
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "gym-nav-active"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <p className="text-sm text-muted-foreground">{activeTabMeta.description}</p>
      </div>

      {activeTab === "general" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label="Имя"
            value={profile.name}
            editing={editingField === "name"}
            onStartEdit={() => startEdit("name", profile.name)}
          >
            <Input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => handleInputKeyDown(event, saveName)}
              className="font-heading text-xl sm:text-2xl"
            />
            {savedField === "name" ? (
              <p className="text-xs text-primary">Сохранено</p>
            ) : null}
          </ProfileField>

          <ProfileField
            label="Фамилия"
            value={profile.lastName}
            editing={editingField === "lastName"}
            onStartEdit={() => startEdit("lastName", profile.lastName)}
          >
            <Input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={saveLastName}
              onKeyDown={(event) => handleInputKeyDown(event, saveLastName)}
              className="font-heading text-xl sm:text-2xl"
            />
            {savedField === "lastName" ? (
              <p className="text-xs text-primary">Сохранено</p>
            ) : null}
          </ProfileField>

          <ProfileField
            label="Email"
            value={profile.email}
            editable={false}
            editing={false}
            onStartEdit={() => undefined}
          />

          <ProfileField
            label="Телефон"
            value={profile.phone}
            editing={editingField === "phone"}
            onStartEdit={() => startEdit("phone", profile.phone)}
          >
            <Input
              autoFocus
              type="tel"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={savePhone}
              onKeyDown={(event) => handleInputKeyDown(event, savePhone)}
              className="font-heading text-xl sm:text-2xl"
            />
            {savedField === "phone" ? (
              <p className="text-xs text-primary">Сохранено</p>
            ) : null}
          </ProfileField>

          <ProfileField
            label="Цель"
            value={goalLabels[profile.goal]}
            editing={editingField === "goal"}
            onStartEdit={() => startEdit("goal", profile.goal)}
            valueClassName="capitalize"
          >
            <Select
              defaultOpen
              value={profile.goal}
              onValueChange={(value) => {
                if (value) saveGoal(value as Goal);
              }}
              onOpenChange={(open) => {
                if (!open && editingField === "goal") {
                  cancelEdit();
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите цель">
                  {goalLabels[profile.goal]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(goalLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savedField === "goal" ? (
              <p className="text-xs text-primary">Сохранено</p>
            ) : null}
          </ProfileField>
        </div>
      ) : null}

      {activeTab === "start" ? (
        <div className="space-y-4">
        <div className="max-w-sm">
          <ProfileField
            label="Стартовый вес"
            value={`${profile.startWeight} кг`}
            hint="Меняет точку отсчёта на графике веса"
            editing={editingField === "startWeight"}
            onStartEdit={requestStartWeightEdit}
            valueClassName="text-primary"
          >
            <>
              {renderWeightInput(saveStartWeight, savedField === "startWeight")}
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Изменение перепишет стартовую запись в истории веса
              </p>
            </>
          </ProfileField>
        </div>

        <MeasurementsGrid
          measurements={profile.startMeasurements}
          scope="start"
          editing={editingMeasurement}
          saved={savedMeasurement}
          draft={draft}
          editWarning="Изменение перепишет стартовую запись в истории замеров"
          onStartEdit={requestStartMeasurementEdit}
          onDraftChange={setDraft}
          onSave={(key) => saveMeasurement("start", key)}
          onKeyDown={(event, key) =>
            handleInputKeyDown(event, () => saveMeasurement("start", key))
          }
        />
        </div>
      ) : null}

      {activeTab === "current" ? (
        <div className="space-y-4">
        <div className="max-w-sm">
          <ProfileField
            label="Текущий вес"
            value={`${profile.currentWeight} кг`}
            hint={`${deltaLabel} кг от старта`}
            editing={editingField === "currentWeight"}
            onStartEdit={() =>
              startEdit("currentWeight", String(profile.currentWeight))
            }
            valueClassName="text-primary"
          >
            {renderWeightInput(saveCurrentWeight, savedField === "currentWeight")}
          </ProfileField>
        </div>

        <MeasurementsGrid
          measurements={profile.currentMeasurements}
          startMeasurements={profile.startMeasurements}
          scope="current"
          editing={editingMeasurement}
          saved={savedMeasurement}
          draft={draft}
          onStartEdit={(key) => startMeasurementEdit("current", key)}
          onDraftChange={setDraft}
          onSave={(key) => saveMeasurement("current", key)}
          onKeyDown={(event, key) =>
            handleInputKeyDown(event, () => saveMeasurement("current", key))
          }
        />
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {isApiEnabled()
          ? "Изменения сохраняются на сервере."
          : "Изменения сохраняются локально в браузере."}
      </p>

      <ConfirmDialog
        open={startWeightWarningOpen}
        title="Изменить стартовый вес?"
        description="Стартовый вес — это точка отсчёта на графике и база для расчёта прогресса. Его изменение обновит самую раннюю запись в истории, но не удалит последующие взвешивания."
        confirmLabel="Изменить"
        confirmVariant="default"
        onConfirm={confirmStartWeightEdit}
        onCancel={() => setStartWeightWarningOpen(false)}
      />

      <ConfirmDialog
        open={startMeasurementWarning !== null}
        title={
          startMeasurementWarning
            ? `Изменить ${measurementFieldLabels[startMeasurementWarning].toLowerCase()}?`
            : "Изменить стартовый замер?"
        }
        description="Стартовый замер — это точка отсчёта на графике и база для расчёта прогресса. Его изменение обновит самую раннюю запись в истории, но не удалит последующие измерения."
        confirmLabel="Изменить"
        confirmVariant="default"
        onConfirm={confirmStartMeasurementEdit}
        onCancel={() => setStartMeasurementWarning(null)}
      />
        </>
      )}
    </div>
  );
}
