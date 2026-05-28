"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WeightPoint = {
  date: string;
  weight: number;
};

type VolumePoint = {
  label: string;
  volume: number;
};

type DashboardChartsProps = {
  weightData: WeightPoint[];
  volumeData: VolumePoint[];
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "oklch(0.18 0.055 295)",
    border: "1px solid oklch(0.33 0.07 295)",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px oklch(0.1 0.05 295 / 50%)",
  },
  labelStyle: { color: "oklch(0.72 0.055 295)" },
  itemStyle: { color: "oklch(0.96 0.02 295)" },
};

const axisProps = {
  tick: { fill: "oklch(0.72 0.055 295)", fontSize: 12 },
  axisLine: { stroke: "oklch(0.33 0.07 295)" },
};

export function DashboardCharts({
  weightData,
  volumeData,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="gym-stat-card border-border/70 bg-card/80 md:col-span-2 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Динамика веса
          </CardTitle>
          <CardDescription>Последние записи из профиля и метрик</CardDescription>
        </CardHeader>
        <CardContent className="h-72 min-h-[288px] min-w-0">
          {!mounted ? (
            <ChartPlaceholder />
          ) : weightData.length > 0 ? (
            <LineChart width={680} height={288} data={weightData} className="max-w-full">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.33 0.07 295)" />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-chart-1)"
                strokeWidth={3}
                dot={{ fill: "var(--color-chart-1)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "var(--color-chart-3)" }}
              />
            </LineChart>
          ) : (
            <p className="text-sm text-muted-foreground">
              Обновите профиль, чтобы увидеть график веса.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gym-stat-card border-border/70 bg-card/80 md:col-span-2 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Объём за тренировку
          </CardTitle>
          <CardDescription>Кг × повторы по каждой сессии</CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-h-[256px] min-w-0">
          {!mounted ? (
            <ChartPlaceholder className="h-64" />
          ) : volumeData.length > 0 ? (
            <BarChart width={680} height={256} data={volumeData} className="max-w-full">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.33 0.07 295)" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="volume" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <p className="text-sm text-muted-foreground">
              Запишите первую тренировку, чтобы увидеть объём.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChartPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-secondary/40 ${className ?? "h-72"}`}
      aria-hidden
    />
  );
}
