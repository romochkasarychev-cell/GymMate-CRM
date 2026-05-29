"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
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
  tick: { fill: "oklch(0.72 0.055 295)", fontSize: 11 },
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
          <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide sm:text-xl">
            Динамика веса
          </CardTitle>
          <CardDescription>Последние записи из профиля и метрик</CardDescription>
        </CardHeader>
        <CardContent className="h-56 min-h-56 min-w-0 sm:h-72 sm:min-h-72">
          {!mounted ? (
            <ChartPlaceholder />
          ) : weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.33 0.07 295)" />
                <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} {...axisProps} width={40} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-chart-1)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-chart-1)", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "var(--color-chart-3)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              Обновите профиль, чтобы увидеть график веса.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gym-stat-card border-border/70 bg-card/80 md:col-span-2 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide sm:text-xl">
            Объём за тренировку
          </CardTitle>
          <CardDescription>Кг × повторы по каждой сессии</CardDescription>
        </CardHeader>
        <CardContent className="h-52 min-h-52 min-w-0 sm:h-64 sm:min-h-64">
          {!mounted ? (
            <ChartPlaceholder className="h-full" />
          ) : volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.33 0.07 295)" />
                <XAxis dataKey="label" {...axisProps} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis {...axisProps} width={40} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="volume" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
      className={`h-full animate-pulse rounded-lg bg-secondary/40 ${className ?? ""}`}
      aria-hidden
    />
  );
}
