export type Role = 'PROFESSOR' | 'ALUNO'

export type User = {
    name: string
    cardNumber: string
    role: Role
}

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

export type Page<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}

export type AtividadeStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA'

export type Feedback = {
    id: number
    texto: string
    professor: UserResponse
    createdAt: string
}

export type AtividadeResponseDTO = {
    id: number
    data: string
    dataConclusao: string | null
    prontuario: string
    nomePaciente: string | null
    observacoes: string | null
    feedbackPrivado: string | null
    status: AtividadeStatus
    aluno: UserResponse
    professorOrientador: UserResponse
    professorTutor: UserResponse | null
    turma: { id: number; disciplina: string; name: string; semester: string }
    atividadePaiId: number | null
    createdAt: string
}
