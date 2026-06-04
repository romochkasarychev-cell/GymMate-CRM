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
import type { MeasurementChartSeries } from "@/lib/dashboard-data";
import { formatShortDate } from "@/lib/labels";

type WeightPoint = {
  label: string;
  timestamp: number;
  weight: number;
};

type VolumePoint = {
  label: string;
  volume: number;
};

type DashboardChartsProps = {
  weightData: WeightPoint[];
  measurementCharts: MeasurementChartSeries[];
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

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function DashboardCharts({
  weightData,
  measurementCharts,
  volumeData,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricLineChartCard
        mounted={mounted}
        title="Динамика веса"
        description="Последние записи из профиля и метрик"
        data={weightData}
        dataKey="weight"
        unit="кг"
        className="md:col-span-2"
        color="var(--color-chart-1)"
      />

      {measurementCharts.map((series, index) => (
        <MetricLineChartCard
          key={series.key}
          mounted={mounted}
          title={series.title}
          description="Стартовая и текущая динамика замера"
          data={series.data}
          dataKey="value"
          unit="см"
          color={chartColors[(index + 1) % chartColors.length]}
        />
      ))}

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

type MetricLineChartCardProps = {
  mounted: boolean;
  title: string;
  description: string;
  data: Array<{ label: string; timestamp: number; [key: string]: string | number }>;
  dataKey: string;
  unit: string;
  color: string;
  className?: string;
};

function MetricLineChartCard({
  mounted,
  title,
  description,
  data,
  dataKey,
  unit,
  color,
  className,
}: MetricLineChartCardProps) {
  const values = data.map((point) => Number(point[dataKey]));
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const padding = unit === "кг" ? 2 : 1;

  return (
    <Card className={`gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm ${className ?? ""}`}>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide sm:text-xl">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-52 min-h-52 min-w-0 sm:h-60 sm:min-h-60">
        {!mounted ? (
          <ChartPlaceholder />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.33 0.07 295)" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => formatShortDate(new Date(value))}
                {...axisProps}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[min - padding, max + padding]}
                {...axisProps}
                width={40}
              />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(_, items) => {
                  const point = items?.[0]?.payload as { label?: string } | undefined;
                  return point?.label ?? "";
                }}
                formatter={(value) => [`${Number(value)} ${unit}`, title]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                name={title}
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "var(--color-chart-3)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            Обновите профиль, чтобы увидеть график.
          </p>
        )}
      </CardContent>
    </Card>
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
