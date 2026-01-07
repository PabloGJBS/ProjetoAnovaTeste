const DEFAULT_API_BASE = "http://localhost:8000";
const ENV_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE;

export function getApiBase(): string {
  if (typeof window === "undefined") {
    return ENV_API_BASE;
  }
  if (ENV_API_BASE.includes("backend")) {
    const host = window.location.hostname || "localhost";
    return `http://${host}:8000`;
  }
  return ENV_API_BASE;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}
