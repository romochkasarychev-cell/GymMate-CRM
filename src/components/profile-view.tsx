"use client";

import { useState } from "react";
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
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { updateProfile } from "@/lib/gymmate-storage";
import { goalLabels } from "@/lib/labels";
import type { Goal, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

type EditableField =
  | "name"
  | "lastName"
  | "phone"
  | "startWeight"
  | "currentWeight"
  | "goal";

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
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        {editing && children ? (
          children
        ) : (
          <>
            <CardTitle
              className={cn(
                "font-heading text-xl font-normal text-foreground sm:text-2xl",
                valueClassName,
              )}
            >
              {value}
            </CardTitle>
            {hint ? <CardDescription>{hint}</CardDescription> : null}
            {editable ? (
              <CardDescription className="text-xs">
                Нажмите, чтобы изменить
              </CardDescription>
            ) : null}
          </>
        )}
      </CardHeader>
    </Card>
  );
}

export function ProfileView() {
  const { profile } = useGymmateStore();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState("");
  const [savedField, setSavedField] = useState<EditableField | null>(null);

  const weightDelta = profile.currentWeight - profile.startWeight;
  const deltaLabel =
    weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1);

  function startEdit(field: EditableField, value: string) {
    setEditingField(field);
    setDraft(value);
    setSavedField(null);
  }

  function cancelEdit() {
    setEditingField(null);
    setDraft("");
  }

  function markSaved(field: EditableField) {
    setSavedField(field);
    window.setTimeout(() => {
      setSavedField((current) => (current === field ? null : current));
    }, 2000);
  }

  function saveProfile(nextProfile: Profile, field: EditableField) {
    updateProfile(nextProfile, profile.currentWeight);
    setEditingField(null);
    setDraft("");
    markSaved(field);
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

    saveProfile({ ...profile, startWeight }, "startWeight");
  }

  function saveCurrentWeight() {
    const currentWeight = Number.parseFloat(draft);
    if (!Number.isFinite(currentWeight) || currentWeight <= 0) return;

    saveProfile({ ...profile, currentWeight }, "currentWeight");
  }

  function saveGoal(goal: Goal) {
    saveProfile({ ...profile, goal }, "goal");
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Личный кабинет"
        description="Стартовые параметры, цель и текущий прогресс"
      />

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
          label="Стартовый вес"
          value={`${profile.startWeight} кг`}
          editing={editingField === "startWeight"}
          onStartEdit={() => startEdit("startWeight", String(profile.startWeight))}
          valueClassName="text-primary"
        >
          <Input
            autoFocus
            type="number"
            step="0.1"
            min="1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={saveStartWeight}
            onKeyDown={(event) => handleInputKeyDown(event, saveStartWeight)}
            className="font-heading text-xl sm:text-2xl"
          />
          {savedField === "startWeight" ? (
            <p className="text-xs text-primary">Сохранено</p>
          ) : null}
        </ProfileField>

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
          <Input
            autoFocus
            type="number"
            step="0.1"
            min="1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={saveCurrentWeight}
            onKeyDown={(event) => handleInputKeyDown(event, saveCurrentWeight)}
            className="font-heading text-xl sm:text-2xl"
          />
          {savedField === "currentWeight" ? (
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

      <p className="text-sm text-muted-foreground">
        Изменения сохраняются локально в браузере.
      </p>
    </div>
  );
}
