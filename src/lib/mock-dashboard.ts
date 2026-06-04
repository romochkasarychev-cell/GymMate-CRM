import { bodyMetrics, profile, workouts } from "@/lib/mock-data";
import { buildAllBaselineMeasurementMetrics } from "@/lib/measurement-metrics";
import { getDashboardData } from "@/lib/dashboard-data";

/** @deprecated Use getDashboardData from dashboard-data with store data */
export function getDashboardDataFromMock() {
  const measurementMetrics = buildAllBaselineMeasurementMetrics(
    profile,
    new Date("2025-11-12T12:00:00"),
    new Date("2026-05-26T12:00:00"),
  );

  return getDashboardData(workouts, bodyMetrics, measurementMetrics, profile);
}
