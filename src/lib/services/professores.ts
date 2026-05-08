import { api } from '@/lib/api'
import type { UserResponse, Page } from '@/types'

export async function listProfessores(params?: { page?: number; size?: number }): Promise<Page<UserResponse>> {
    const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 100),
    })
    const result = await api.get<Page<UserResponse> | UserResponse[]>(`/v1/professores?${query}`)
    if (Array.isArray(result)) {
        return { content: result, totalElements: result.length, totalPages: 1, number: 0, size: result.length }
    }
    return result
}
