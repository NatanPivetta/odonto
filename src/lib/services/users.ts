import { api } from '@/lib/api'
import type { Role, UserResponse, Page } from '@/types'

export interface CreateUserRequest {
    name: string
    email: string
    cardNumber: string  // ate 8 digitos; backend completa zeros a esquerda
    password: string    // minimo 8 caracteres
    role: Role
}

export interface UpdateUserRequest {
    name?: string
    email?: string
    role?: Role
    active?: boolean
}

export function createUser(data: CreateUserRequest) {
    return api.post<UserResponse>('/v1/users', data)
}

export function listUsers(params?: { page?: number; size?: number; sort?: string }) {
    const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 20),
        sort: params?.sort ?? 'name',
    })
    return api.get<Page<UserResponse>>(`/v1/users?${query}`)
}

export function listAlunos(params?: { active?: boolean; page?: number; size?: number }) {
    const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 100),
    })
    if (params?.active !== undefined) query.set('active', String(params.active))
    return api.get<Page<UserResponse>>(`/v1/alunos?${query}`)
}

export function getUserById(id: number) {
    return api.get<UserResponse>(`/v1/users/${id}`)
}

export function updateUser(id: number, data: UpdateUserRequest) {
    return api.put<UserResponse>(`/v1/users/${id}`, data)
}

export function deleteUser(id: number) {
    return api.delete(`/v1/users/${id}`)
}
