import { api } from '@/lib/api'
import { listUsers } from '@/lib/services/users'
import type { UserResponse, Page } from '@/types'

export async function listProfessores(params?: { active?: boolean; page?: number; size?: number }): Promise<Page<UserResponse>> {
    const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 100),
    })
    if (params?.active !== undefined) query.set('active', String(params.active))

    try {
        const result = await api.get<Page<UserResponse> | UserResponse[]>(`/v1/professor?${query}`)

        // Backend pode retornar array simples em vez de Page
        if (Array.isArray(result)) {
            return { content: result, totalElements: result.length, totalPages: 1, number: 0, size: result.length }
        }
        return result
    } catch (err) {
        console.error('[listProfessores] /v1/professor falhou, usando fallback via /v1/users:', err)
        const all = await listUsers({ size: 200 })
        const profs = all.content.filter(u => u.role === 'PROFESSOR')
        return { ...all, content: profs }
    }
}
