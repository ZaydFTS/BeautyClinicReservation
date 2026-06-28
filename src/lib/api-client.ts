// Simple typed fetch helpers for API calls
// Used by client components and TanStack Query hooks

export async function api<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed: ${res.status}`)
  }
  return data as T
}

export const apiGet = <T = unknown>(url: string) => api<T>(url)
export const apiPost = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined })
export const apiPut = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined })
export const apiPatch = <T = unknown>(url: string, body?: unknown) =>
  api<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined })
export const apiDelete = <T = unknown>(url: string) =>
  api<T>(url, { method: "DELETE" })
