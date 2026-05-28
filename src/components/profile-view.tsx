"use client";

import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { goalLabels } from "@/lib/labels";

export function ProfileView() {
  const { profile } = useGymmateStore();

  return (
    <div className="space-y-8">
      <PageHeader title="Профиль" description="Цели, параметры и настройки атлета" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
              Настройки
            </CardTitle>
            <CardDescription>Имя, цель и текущий вес</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
              Атлет
            </CardTitle>
            <CardDescription>Текущие показатели</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Email</span>
              <span>{profile.email}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Цель</span>
              <span className="text-primary">{goalLabels[profile.goal]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Текущий вес</span>
              <span className="font-heading text-lg">{profile.currentWeight} кг</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
