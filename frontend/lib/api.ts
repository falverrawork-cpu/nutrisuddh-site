export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const apiBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "")
    .trim()
    .replace(/\/$/, "");
  const isLocalhostClient =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const localDevFallback = isLocalhostClient ? "http://localhost:8787" : "";
  const effectiveBaseUrl = apiBaseUrl || localDevFallback;
  const requestUrl = /^https?:\/\//.test(path)
    ? path
    : effectiveBaseUrl
      ? `${effectiveBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
      : path;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      headers
    });
  } catch (error) {
    const hint =
      isLocalhostClient && requestUrl.startsWith("http://localhost:8787")
        ? " Backend may not be running on http://localhost:8787."
        : "";
    throw new Error(`Network error calling ${requestUrl}.${hint}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;
  const fallbackText = !isJson ? (await response.text()).slice(0, 160) : "";

  if (!response.ok) {
    const message = payload && typeof payload.error === "string"
      ? payload.error
      : `Request failed (${response.status}) at ${requestUrl}${fallbackText ? `: ${fallbackText}` : ""}`;
    throw new Error(message);
  }

  return payload as T;
}
