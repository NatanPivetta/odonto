import { api } from '@/lib/api'
import type { Feedback } from '@/types'

export function listFeedbacks(atividadeId: number) {
    return api.get<Feedback[]>(`/v1/atividades/${atividadeId}/feedbacks`)
}

export function createFeedback(atividadeId: number, texto: string) {
    return api.post<Feedback>(`/v1/atividades/${atividadeId}/feedbacks`, { texto })
}

export function deleteFeedback(atividadeId: number, feedbackId: number) {
    return api.delete(`/v1/atividades/${atividadeId}/feedbacks/${feedbackId}`)
}
