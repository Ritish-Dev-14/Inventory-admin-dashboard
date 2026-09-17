export const API_URL = "/api/v1";

export async function fetchStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchDepartments() {
  const res = await fetch(`${API_URL}/departments`);
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function fetchItems(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/items?${q}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export async function createItem(data: any) {
  const res = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create item");
  return res.json();
}

export async function updateItem(id: number, data: any) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
}

export async function deleteItem(id: number) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete item");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_URL}/alerts/negative`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchUnknowns() {
  const res = await fetch(`${API_URL}/alerts/unknown`);
  if (!res.ok) throw new Error("Failed to fetch unknown alerts");
  return res.json();
}

export async function fetchSummaryReport() {
  const res = await fetch(`${API_URL}/reports/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function importExcel(file: File, mode: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  
  const res = await fetch(`${API_URL}/import`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error("Import failed");
  return res.json();
}
