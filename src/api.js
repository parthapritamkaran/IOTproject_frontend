const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchLatestTrucks() {
  const res = await fetch(`${API_BASE}/api/latest-trucks`);
  if (!res.ok) {
    throw new Error("Failed to fetch latest trucks");
  }
  return res.json();
}

export { API_BASE };