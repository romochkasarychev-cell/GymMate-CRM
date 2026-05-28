"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/lib/gymmate-storage";
import { goalLabels } from "@/lib/labels";
import type { Goal, Profile } from "@/lib/types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [currentWeight, setCurrentWeight] = useState(String(profile.currentWeight));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setGoal(profile.goal);
    setCurrentWeight(String(profile.currentWeight));
    setSaved(false);
  }, [profile.name, profile.goal, profile.currentWeight]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProfile: Profile = {
      ...profile,
      name: name.trim(),
      goal,
      currentWeight: Number.parseFloat(currentWeight) || profile.currentWeight,
    };

    updateProfile(nextProfile, profile.currentWeight);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">Цель</Label>
        <Select
          value={goal}
          onValueChange={(value) => {
            if (value) {
              setGoal(value as Goal);
              setSaved(false);
            }
          }}
        >
          <SelectTrigger id="goal" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(goalLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentWeight">Текущий вес (кг)</Label>
        <Input
          id="currentWeight"
          name="currentWeight"
          type="number"
          step="0.1"
          min="1"
          value={currentWeight}
          onChange={(event) => {
            setCurrentWeight(event.target.value);
            setSaved(false);
          }}
          required
        />
      </div>

      {saved ? (
        <p className="text-sm text-primary">Сохранено локально в браузере.</p>
      ) : null}

      <Button type="submit" className="gym-btn-primary h-9 px-4">
        Сохранить
      </Button>
    </form>
  );
}
