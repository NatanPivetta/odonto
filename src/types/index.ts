export type Role = 'PROFESSOR' | 'ALUNO'

export type User = {
    id: string
    name: string
    email: string
    role: Role
    matricula?: string   // alunos
    siape?: string       // professores
}

export type ActivityStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'REPROVADO'

export type Activity = {
    id: string
    title: string
    description: string
    requiredCount: number
    completedCount: number
    status: ActivityStatus
    createdBy: string
    createdAt: string
}