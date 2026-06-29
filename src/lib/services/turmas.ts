import { api } from '@/lib/api'
import type { Turma, Page } from '@/types'

export interface CreateTurmaRequest {
    disciplina: string  // max 20
    name: string        // max 100
    semester: string    // max 10, ex: "2026/1"
}

export interface UpdateTurmaRequest {
    disciplina?: string
    name?: string
    semester?: string
    active?: boolean
}

export function createTurma(data: CreateTurmaRequest) {
    return api.post<Turma>('/v1/turmas', data)
}

export function listTurmas(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 20),
    })
    return api.get<Page<Turma>>(`/v1/turmas?${query}`)
}

export function listTurmasDoAluno(alunoId: number) {
    return api.get<Turma[]>(`/v1/turmas/aluno/${alunoId}`)
}

export function getTurmaById(id: number) {
    return api.get<Turma>(`/v1/turmas/${id}`)
}

export function updateTurma(id: number, data: UpdateTurmaRequest) {
    return api.put<Turma>(`/v1/turmas/${id}`, data)
}

export function deleteTurma(id: number) {
    return api.delete(`/v1/turmas/${id}`)
}

export function addAlunoToTurma(turmaId: number, alunoId: number) {
    return api.post<Turma>(`/v1/turmas/${turmaId}/alunos/${alunoId}`)
}

export function removeAlunoFromTurma(turmaId: number, alunoId: number) {
    return api.delete(`/v1/turmas/${turmaId}/alunos/${alunoId}`)
}

export function addAlunosBulk(turmaId: number, alunoIds: number[]) {
    return api.post<Turma>(`/v1/turmas/${turmaId}/alunos/bulk`, { alunoIds })
}

export function removeAlunosBulk(turmaId: number, alunoIds: number[]) {
    return api.delete<void>(`/v1/turmas/${turmaId}/alunos/bulk`, { alunoIds })
}
