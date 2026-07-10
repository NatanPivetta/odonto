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

export type DisciplinaClinica =
    | 'CLINICA_ODONTOLOGICA_I'
    | 'CLINICA_ODONTOLOGICA_II'
    | 'CLINICA_ODONTOLOGICA_III'
    | 'CLINICA_ODONTOLOGICA_IV'

export type DisciplinaClinicaOption = {
    value: DisciplinaClinica
    codigo: string
    nome: string
    label: string
}

export type Turma = {
    id: number
    disciplina: DisciplinaClinica
    disciplinaCodigo: string
    disciplinaNome: string
    disciplinaLabel: string
    codigoTurma: string
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

export type AtividadeStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ALTA'

export type TipoAtividade =
    | 'ENTREVISTA_DECAPAGEM_EXAME'
    | 'ESTOMATOLOGIA_PATOLOGIA'
    | 'BIOPSIA'
    | 'EXAME_LABORATORIAL'
    | 'EXAME_MICROBIOLOGICO'
    | 'AFASTAMENTO_DENTARIO'
    | 'ATF'
    | 'ORIENTACAO_HB_ROHB'
    | 'RESTAURACAO_PROVISORIA'
    | 'RESTAURACAO_RESINA_POSTERIOR'
    | 'RESTAURACAO_RESINA_ANTERIOR'
    | 'CONFECCAO_DE_GUIA'
    | 'RESTAURACAO_AMALGAMA'
    | 'ACABAMENTO_POLIMENTO'
    | 'REPARO_CONSERTO_RESTAURACAO'
    | 'INLAY_ONLAY'
    | 'FACETAS'
    | 'CLAREAMENTO_VITAL'
    | 'RAP_OHB'
    | 'RASUB'
    | 'EXAME_INTERMEDIARIO_PERIODONTAL'
    | 'CIRURGIA_PERIODONTAL'
    | 'PLACA_MIORRELAXANTE'
    | 'ENDODONTIA_MONO'
    | 'ENDODONTIA_PRE_MOLAR'
    | 'ENDODONTIA_MOLAR'
    | 'PULPOTOMIA'
    | 'CLAREAMENTO_INTERNO'
    | 'PROVISORIO_PROTESE_FIXA'
    | 'NUCLEO'
    | 'COROA'
    | 'PPR'
    | 'PT'
    | 'PPF'
    | 'PPR_PROVISORIA'
    | 'URGENCIA'
    | 'CONSERTO_PROTESE'
    | 'OUTROS'

export const TIPO_ATIVIDADE_OPTIONS: { value: TipoAtividade; label: string }[] = [
    { value: 'ENTREVISTA_DECAPAGEM_EXAME',      label: 'Entrevista + Decapagem + Exame' },
    { value: 'ESTOMATOLOGIA_PATOLOGIA',          label: 'Estomatologia / Patologia (sessão)' },
    { value: 'BIOPSIA',                          label: 'Biópsia' },
    { value: 'EXAME_LABORATORIAL',               label: 'Exame Laboratorial' },
    { value: 'EXAME_MICROBIOLOGICO',             label: 'Exame Microbiológico' },
    { value: 'AFASTAMENTO_DENTARIO',             label: 'Afastamento Dentário' },
    { value: 'ATF',                              label: 'ATF (sessão)' },
    { value: 'ORIENTACAO_HB_ROHB',              label: 'Orientação de HB + ROHB' },
    { value: 'RESTAURACAO_PROVISORIA',           label: 'Restauração Provisória' },
    { value: 'RESTAURACAO_RESINA_POSTERIOR',     label: 'Restauração Resina Posterior' },
    { value: 'RESTAURACAO_RESINA_ANTERIOR',      label: 'Restauração Resina Anterior' },
    { value: 'CONFECCAO_DE_GUIA',               label: 'Confecção de Guia' },
    { value: 'RESTAURACAO_AMALGAMA',             label: 'Restauração Amálgama' },
    { value: 'ACABAMENTO_POLIMENTO',             label: 'Acabamento/Polimento' },
    { value: 'REPARO_CONSERTO_RESTAURACAO',      label: 'Reparo/Conserto Restauração' },
    { value: 'INLAY_ONLAY',                      label: 'Inlay/Onlay' },
    { value: 'FACETAS',                          label: 'Facetas' },
    { value: 'CLAREAMENTO_VITAL',                label: 'Clareamento Vital' },
    { value: 'RAP_OHB',                          label: 'RAP + OHB (sessão)' },
    { value: 'RASUB',                            label: 'RASUB (sessão)' },
    { value: 'EXAME_INTERMEDIARIO_PERIODONTAL',  label: 'Exame intermediário Periodontal' },
    { value: 'CIRURGIA_PERIODONTAL',             label: 'Cirurgia Periodontal' },
    { value: 'PLACA_MIORRELAXANTE',              label: 'Placa Miorrelaxante' },
    { value: 'ENDODONTIA_MONO',                  label: 'Endodontia Mono' },
    { value: 'ENDODONTIA_PRE_MOLAR',             label: 'Endodontia Pré-Molar' },
    { value: 'ENDODONTIA_MOLAR',                 label: 'Endodontia Molar' },
    { value: 'PULPOTOMIA',                       label: 'Pulpotomia' },
    { value: 'CLAREAMENTO_INTERNO',              label: 'Clareamento Interno' },
    { value: 'PROVISORIO_PROTESE_FIXA',          label: 'Provisório (prótese fixa)' },
    { value: 'NUCLEO',                           label: 'Núcleo' },
    { value: 'COROA',                            label: 'Coroa' },
    { value: 'PPR',                              label: 'PPR' },
    { value: 'PT',                               label: 'PT' },
    { value: 'PPF',                              label: 'PPF' },
    { value: 'PPR_PROVISORIA',                   label: 'PPR Provisória' },
    { value: 'URGENCIA',                         label: 'Urgência' },
    { value: 'CONSERTO_PROTESE',                 label: 'Conserto Prótese' },
    { value: 'OUTROS',                           label: 'Outros (especificar)' },
]

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
    status: AtividadeStatus
    tipo: TipoAtividade | null
    tipoDescricao: string | null
    aluno: UserResponse
    professorOrientador: UserResponse
    professorTutor: UserResponse | null
    turma: {
        id: number
        disciplina: DisciplinaClinica
        disciplinaCodigo: string
        disciplinaNome: string
        disciplinaLabel: string
        codigoTurma: string
        name: string
        semester: string
    }
    atividadePaiId: number | null
    createdAt: string
}
