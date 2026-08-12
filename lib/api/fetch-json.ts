/**
 * Parses a fetch Response that is expected to be JSON. A server crash or proxy can
 * return an HTML error page, which would otherwise surface as a confusing
 * "Unexpected token '<'" JSON parse error.
 */
export async function readJsonResponse<T = unknown>(
  response: Response,
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  const raw = await response.text();

  let data: T | null = null;
  let parseFailed = false;

  if (raw.trim()) {
    try {
      data = JSON.parse(raw) as T;
    } catch {
      parseFailed = true;
    }
  }

  if (response.ok && !parseFailed) {
    return { ok: true, status: response.status, data, error: null };
  }

  if (parseFailed) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: `Server returned an unexpected response (HTTP ${response.status}). Check the dev server console for details.`,
    };
  }

  const payload = data as { error?: string; detail?: string } | null;
  const message = payload?.error || `Request failed (HTTP ${response.status}).`;

  return {
    ok: false,
    status: response.status,
    data,
    error: payload?.detail ? `${message} (${payload.detail})` : message,
  };
}
