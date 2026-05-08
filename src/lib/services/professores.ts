import { listUsers } from '@/lib/services/users'
import type { UserResponse, Page } from '@/types'

export async function listProfessores(params?: { active?: boolean; page?: number; size?: number }): Promise<Page<UserResponse>> {
    const all = await listUsers({ size: params?.size ?? 200, page: params?.page ?? 0 })
    const profs = all.content.filter(u =>
        u.role === 'PROFESSOR' && (params?.active === undefined || u.active === params.active)
    )
    return { ...all, content: profs }
}
