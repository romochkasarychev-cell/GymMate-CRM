import { bodyMetrics, profile, workouts } from "@/lib/mock-data";
import { getDashboardData } from "@/lib/dashboard-data";

/** @deprecated Use getDashboardData from dashboard-data with store data */
export function getDashboardDataFromMock() {
  return getDashboardData(workouts, bodyMetrics, profile);
}
