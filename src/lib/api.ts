const RAW_BASE = import.meta.env.VITE_API_URL ?? '';
const API_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;
const USER_ID_KEY = 'roadmap-ai-user-id';

export function getUserId(): string {
  let id: string | null;
  try {
    id = localStorage.getItem(USER_ID_KEY);
  } catch {
    id = null;
  }
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(USER_ID_KEY, id);
    } catch {
      // ignore quota
    }
  }
  return id;
}

export function setUserId(id: string): void {
  try {
    localStorage.setItem(USER_ID_KEY, id);
  } catch {
    // ignore
  }
}

interface ApiSuccess<T> { success: true; data: T; message?: string }
interface ApiError { success: false; error: string; message?: string; details?: unknown }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const userId = getUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    'X-Request-Id': crypto.randomUUID(),
    ...(init.headers as Record<string, string> | undefined),
  };

  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    throw new Error(`Network error: ${e instanceof Error ? e.message : String(e)}. Is the backend running at ${API_BASE || 'same origin'}?`, { cause: e });
  }

  const text = await res.text();
  let body: ApiSuccess<T> | ApiError | null;
  try {
    body = text ? (JSON.parse(text) as ApiSuccess<T> | ApiError) : null;
  } catch {
    body = null;
  }

  if (!res.ok || !body || body.success === false) {
    const msg = (body as ApiError)?.error ?? (text ? text.slice(0, 500) : `Request failed: ${res.status} ${res.statusText}`);
    const details = (body as ApiError)?.details;
    const err = new Error(details ? `${msg}: ${JSON.stringify(details)}` : msg);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  const successBody = body as ApiSuccess<T>;
  const serverUserId = res.headers.get('X-User-Id');
  if (serverUserId && serverUserId !== userId) setUserId(serverUserId);

  return successBody.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { API_BASE };
