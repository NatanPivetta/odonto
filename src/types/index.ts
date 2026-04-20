export type Role = 'PROFESSOR' | 'ALUNO'

// Usuário autenticado (sessão local — vem do login)
export type User = {
    name: string
    cardNumber: string
    role: Role
}

// Usuário completo retornado pelo backend (listagens, turmas)
export type UserResponse = {
    id: number
    name: string
    email: string
    cardNumber: string
    role: Role
    active: boolean
    createdAt: string
}

export type Turma = {
    id: number
    disciplina: string
    name: string
    semester: string
    active: boolean
    alunos: UserResponse[]
    createdAt: string
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