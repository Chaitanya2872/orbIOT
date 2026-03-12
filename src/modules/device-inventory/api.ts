const ENV_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined);
const API_BASE_URL = ENV_API_BASE?.trim() ? ENV_API_BASE : "http://localhost:4000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type FallbackHttpMethod = "PUT" | "PATCH";
export type EntityId = string | number;

export interface CrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  list: () => Promise<T[]>;
  getById: (id: EntityId) => Promise<T>;
  create: (payload: CreateInput) => Promise<T>;
  update: (id: EntityId, payload: UpdateInput) => Promise<T>;
  remove: (id: EntityId) => Promise<void>;
}

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("orbit_token") ??
    window.localStorage.getItem("access_token") ??
    window.localStorage.getItem("token")
  );
};

async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload?.message) message = errorPayload.message;
    } catch {
      // ignore JSON parse failures and keep fallback message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function apiRequestWithFallback<T>(
  path: string,
  primaryMethod: FallbackHttpMethod,
  fallbackMethod: FallbackHttpMethod,
  body?: unknown
): Promise<T> {
  try {
    return await apiRequest<T>(path, primaryMethod, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const shouldFallback =
      message.includes("(404)") || message.includes("(405)") || message.includes("(501)");

    if (!shouldFallback) {
      throw error;
    }

    return apiRequest<T>(path, fallbackMethod, body);
  }
}

function createCrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  resourcePath: string
): CrudApi<T, CreateInput, UpdateInput> {
  return {
    list: () => apiRequest<T[]>(`/${resourcePath}`, "GET"),
    getById: (id: EntityId) => apiRequest<T>(`/${resourcePath}/${id}`, "GET"),
    create: (payload: CreateInput) => apiRequest<T>(`/${resourcePath}`, "POST", payload),
    update: (id: EntityId, payload: UpdateInput) =>
      apiRequestWithFallback<T>(`/${resourcePath}/${id}`, "PATCH", "PUT", payload),
    remove: (id: EntityId) => apiRequest<void>(`/${resourcePath}/${id}`, "DELETE"),
  };
}

export const deviceInventoryApi = {
  vendors: createCrudApi<any>("vendors"),
  parameters: createCrudApi<any>("parameters"),
  itemTypes: createCrudApi<any>("item-types"),
  communications: createCrudApi<any>("communications"),
  messages: createCrudApi<any>("messages"),
  items: createCrudApi<any>("items"),
  devices: createCrudApi<any>("devices"),
};
