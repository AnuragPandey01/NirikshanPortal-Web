/** Base URL for NirikshanPortal-Backend (FastAPI). No trailing slash. */
export function getAnalysisApiUrl() {
  const raw = import.meta.env.VITE_ANALYSIS_API_URL || "http://127.0.0.1:8000";
  return String(raw).replace(/\/$/, "");
}

/**
 * Queue background analysis for a case. `authToken` is PocketBase authStore.token.
 */
export async function enqueueAnalysisJob(authToken, body) {
  const res = await fetch(`${getAnalysisApiUrl()}/api/analysis/jobs`, {
    method: "POST",
    headers: {
      Authorization: authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text || res.statusText };
  }
  if (!res.ok) {
    const detail = data.detail ?? data.message;
    const msg =
      typeof detail === "string"
        ? detail
        : detail != null
          ? JSON.stringify(detail)
          : text || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}
