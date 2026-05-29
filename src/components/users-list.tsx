"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/lib/mock-data";
import { formatDate, goalLabels, userStatusLabels } from "@/lib/labels";
import { formatTrainingTenure } from "@/lib/user-tenure";
import type { UserStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const userStatusStyles: Record<UserStatus, string> = {
  ACTIVE: "border-primary/30 bg-primary/15 text-primary",
  INACTIVE: "border-border/60 bg-secondary/40 text-muted-foreground",
};

export function UsersList() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Пользователи"
        description="Список атлетов и их текущие показатели"
      />

      <div className="grid gap-4">
        {users.map((user) => {
          const weightDelta = user.currentWeight - user.startWeight;
          const deltaLabel =
            weightDelta > 0
              ? `+${weightDelta.toFixed(1)}`
              : weightDelta.toFixed(1);

          return (
            <Card
              key={user.id}
              className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide sm:text-xl">
                    {user.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "shrink-0 font-medium",
                      userStatusStyles[user.status],
                    )}
                  >
                    {userStatusLabels[user.status]}
                  </Badge>
                </div>
                <CardDescription className="space-y-1">
                  <span className="block">{user.email}</span>
                  <span className="block text-xs">
                    Регистрация: {formatDate(user.registeredAt)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Стартовый вес</p>
                  <p className="font-heading text-2xl text-primary">{user.startWeight} кг</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Текущий вес</p>
                  <p className="font-heading text-2xl text-primary">{user.currentWeight} кг</p>
                  <p className="text-xs text-muted-foreground">{deltaLabel} кг</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Стаж тренировок</p>
                  <p className="font-heading text-lg text-foreground">
                    {formatTrainingTenure(user)}
                  </p>
                  {user.status === "INACTIVE" && user.inactiveSince ? (
                    <p className="text-xs text-muted-foreground">
                      Заморожен с {formatDate(user.inactiveSince)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Цель</p>
                  <p className="font-heading text-lg capitalize text-foreground">
                    {goalLabels[user.goal]}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
