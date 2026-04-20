import { api, tokenStorage } from '@/lib/api'
import type { Role } from '@/types'

// ── Tipos espelhando os DTOs do backend ────────────────────────────

export interface LoginRequest {
  cardNumber: string
  password: string
}

export interface LoginResponse {
  token: string
  name: string
  cardNumber: string
  role: Role
}

// ── Serviço ────────────────────────────────────────────────────────

/**
 * Autentica via número de cartão + senha.
 *
 * O token JWT retornado é armazenado em localStorage e injetado
 * automaticamente em todas as chamadas subsequentes pelo `api` client.
 *
 * Ponto de extensão: se no futuro adicionarmos OAuth/Google como
 * método alternativo, o token recebido do provider externo pode ser
 * trocado por um token interno aqui (token exchange), mantendo o
 * cardNumber como identidade canônica do usuário no sistema.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', credentials)
  tokenStorage.set(data.token)
  return data
}

export function logout() {
  tokenStorage.clear()
}
