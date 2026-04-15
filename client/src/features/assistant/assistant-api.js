import { apiClient } from "../../lib/api/client";

export async function chatWithAssistant(message) {
  const response = await apiClient.post("/assistant/chat", { message });
  return response.data.data;
}
