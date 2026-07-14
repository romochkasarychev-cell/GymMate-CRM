type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const API_BASE = "https://platform.fatsecret.com/rest";

const globalForFatSecret = globalThis as typeof globalThis & {
  fatSecretToken?: CachedToken;
};

export function isFatSecretEnabled(): boolean {
  if (process.env.FATSECRET_ENABLED === "false") return false;
  return Boolean(process.env.FATSECRET_CLIENT_ID && process.env.FATSECRET_CLIENT_SECRET);
}

function getScope(): string {
  return process.env.FATSECRET_SCOPE?.trim() || "basic";
}

async function requestAccessToken(): Promise<string> {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("FatSecret credentials are not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: getScope(),
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FatSecret token request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as TokenResponse;
  const expiresInMs = Math.max(data.expires_in - 300, 60) * 1000;

  globalForFatSecret.fatSecretToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  return data.access_token;
}

export async function getFatSecretAccessToken(): Promise<string> {
  const cached = globalForFatSecret.fatSecretToken;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.accessToken;
  }

  return requestAccessToken();
}

export async function fatSecretGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const token = await getFatSecretAccessToken();
  const searchParams = new URLSearchParams({ format: "json" });

  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const region = process.env.FATSECRET_REGION?.trim();
  if (region) {
    searchParams.set("region", region);
  }

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FatSecret API request failed: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}
