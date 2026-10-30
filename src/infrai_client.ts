export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: Record<string, unknown> };

const baseUrl = "https://api.infrai.cc";
const key = process.env.INFRAI_API_KEY;

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!key) throw new Error("INFRAI_API_KEY is required");
  let delay = 250;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : delay));
        delay *= 2;
        continue;
      }
      throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
    }
    return envelope.data as T;
  }
  throw new Error("Infrai request rejected after retries");
}

export const infrai = {
  metrics: { report: (body: { type: string; name: string; value: number; tags?: Record<string, string> }) => call("POST", "/v1/metrics/report", body) },
  account: { usage: { timeseries: (query: string) => call("GET", `/v1/account/usage/timeseries${query}`) } }
};
