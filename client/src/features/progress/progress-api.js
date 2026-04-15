import { apiClient } from "../../lib/api/client";

export async function fetchDailyProgress(date) {
  const response = await apiClient.get("/dashboard/daily", {
    params: { date },
  });

  return response.data.data;
}

export async function fetchWeeklyProgress(weekStart) {
  const response = await apiClient.get("/dashboard/weekly", {
    params: { weekStart },
  });

  return response.data.data;
}
