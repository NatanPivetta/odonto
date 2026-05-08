import { api } from '@/lib/api'
import type { AtividadeResponseDTO, AtividadeStatus, Page } from '@/types'

export interface ListAtividadesParams {
    alunoId?: number
    turmaId?: number
    page?: number
    size?: number
    sort?: string
    direction?: 'ASC' | 'DESC'
}

export interface CreateAtividadeProfessorRequest {
    data: string
    dataConclusao?: string | null
    prontuario: string
    nomePaciente?: string | null
    observacoes?: string | null
    status: AtividadeStatus
    alunoId: number
    professorOrientadorId: number
    professorTutorId?: number | null
    turmaId: number
    atividadePaiId?: number | null
}

export interface CreateAtividadeAlunoRequest {
    data: string
    dataConclusao?: string | null
    prontuario: string
    nomePaciente?: string | null
    observacoes?: string | null
    status?: AtividadeStatus
    professorOrientadorId: number
    professorTutorId?: number | null
    atividadePaiId?: number | null
}

export interface UpdateAtividadeProfessorRequest {
    data?: string | null
    dataConclusao?: string | null
    prontuario?: string | null
    nomePaciente?: string | null
    observacoes?: string | null
    feedbackPrivado?: string | null
    professorOrientadorId?: number | null
    professorTutorId?: number | null
}

export interface UpdateAtividadeAlunoRequest {
    data?: string | null
    dataConclusao?: string | null
    prontuario?: string | null
    nomePaciente?: string | null
    observacoes?: string | null
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const q = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) q.set(key, String(value))
    }
    return q.toString()
}

export function listAtividades(params?: ListAtividadesParams) {
    const query = buildQuery({
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? 'data',
        direction: params?.direction ?? 'DESC',
        ...(params?.alunoId !== undefined ? { alunoId: params.alunoId } : {}),
        ...(params?.turmaId !== undefined ? { turmaId: params.turmaId } : {}),
    })
    return api.get<Page<AtividadeResponseDTO>>(`/v1/atividades?${query}`)
}

export function listMinhasAtividades(params?: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' }) {
    const query = buildQuery({
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? 'data',
        direction: params?.direction ?? 'DESC',
    })
    return api.get<Page<AtividadeResponseDTO>>(`/v1/atividades/minhas?${query}`)
}

export function getAtividadeById(id: number) {
    return api.get<AtividadeResponseDTO>(`/v1/atividades/${id}`)
}

export function createAtividadeProfessor(data: CreateAtividadeProfessorRequest) {
    return api.post<AtividadeResponseDTO>('/v1/atividades', data)
}

export function createAtividadeAluno(data: CreateAtividadeAlunoRequest) {
    return api.post<AtividadeResponseDTO>('/v1/atividades/aluno', data)
}

export function updateAtividadeProfessor(id: number, data: UpdateAtividadeProfessorRequest) {
    return api.put<AtividadeResponseDTO>(`/v1/atividades/${id}`, data)
}

export function updateAtividadeAluno(id: number, data: UpdateAtividadeAlunoRequest) {
    return api.patch<AtividadeResponseDTO>(`/v1/atividades/${id}`, data)
}

export function updateStatusAtividade(id: number, status: AtividadeStatus) {
    return api.patch<AtividadeResponseDTO>(`/v1/atividades/${id}/status`, { status })
}

export function deleteAtividade(id: number) {
    return api.delete(`/v1/atividades/${id}`)
}
