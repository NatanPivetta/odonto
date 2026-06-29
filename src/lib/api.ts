const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL não está definida. Verifique seu .env.local.')
}

// ── Erro tipado ────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  get isNotFound() {
    return this.status === 404
  }
}

// ── Gestão de token ────────────────────────────────────────────────
// Isolado aqui para facilitar troca futura por cookies / OAuth tokens.

const TOKEN_KEY = 'odonto.token'

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

// ── Cliente base ───────────────────────────────────────────────────

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      tokenStorage.clear()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    const body = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, body)
  }

  // 204 No Content — retorna undefined sem tentar parsear JSON
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ── Helpers de método ──────────────────────────────────────────────

export const api = {
  get<T>(path: string) {
    return request<T>(path)
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'POST',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  },
  put<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  },
  delete<T = void>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'DELETE',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  },
}
