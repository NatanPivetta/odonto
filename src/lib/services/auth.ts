import { api, tokenStorage } from '@/lib/api'
import type { Role } from '@/types'

// ── Tipos espelhando os DTOs do backend ────────────────────────────

export interface LoginRequest {
  cardNumber: string
  password: string
}

export interface SendVerificationCodeRequest {
  name: string
  email: string
  cardNumber: string
}

export interface RegisterRequest {
  name: string
  email: string
  cardNumber: string
  password: string
  code: string
}

export interface LoginResponse {
  token: string
  name: string
  cardNumber: string
  role: Role
}

// ── Serviço ────────────────────────────────────────────────────────

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', credentials)
  tokenStorage.set(data.token)
  return data
}

export async function sendVerificationCode(data: SendVerificationCodeRequest): Promise<void> {
  await api.post('/auth/verify/send', data)
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/register', data)
  tokenStorage.set(response.token)
  return response
}

export function logout() {
  tokenStorage.clear()
}
