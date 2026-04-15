import { apiClient } from "../../lib/api/client";

export async function fetchCurrentGoal() {
  const response = await apiClient.get("/goals");
  return response.data.data;
}

export async function saveCurrentGoal(payload) {
  const response = await apiClient.put("/goals", payload);
  return response.data.data;
}
