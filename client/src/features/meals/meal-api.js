import { apiClient } from "../../lib/api/client";

export async function fetchMealsForDate(date) {
  const response = await apiClient.get("/meals", {
    params: {
      date,
    },
  });

  return response.data.data;
}

export async function uploadMealImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/meals/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

export async function createMealEntry(payload) {
  const response = await apiClient.post("/meals", payload);
  return response.data.data;
}

export async function deleteMealEntry(id) {
  const response = await apiClient.delete(`/meals/${id}`);
  return response.data.data;
}
