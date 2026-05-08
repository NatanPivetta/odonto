'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { AtividadeResponseDTO, AtividadeStatus, UserResponse } from '@/types'
import type { Turma } from '@/types'
import { createAtividadeProfessor, createAtividadeAluno } from '@/lib/services/atividades'
import { listAlunos } from '@/lib/services/users'
import { listTurmas } from '@/lib/services/turmas'
import { listUsers } from '@/lib/services/users'
import { useAuth } from '@/lib/auth'

interface NewActivityModalProps {
    open: boolean
    onClose: () => void
    onSave: (atividade: AtividadeResponseDTO) => void
    role: 'PROFESSOR' | 'ALUNO'
}

const STATUS_OPTIONS: { value: AtividadeStatus; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
]

export default function NewActivityModal({ open, onClose, onSave, role }: NewActivityModalProps) {
    const { user } = useAuth()

    // campos comuns
    const [data, setData]               = useState('')
    const [dataConclusao, setDataConclusao] = useState('')
    const [prontuario, setProntuario]   = useState('')
    const [nomePaciente, setNomePaciente] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [status, setStatus]           = useState<AtividadeStatus>('PENDENTE')

    // professor
    const [alunoId, setAlunoId]                   = useState('')
    const [turmaId, setTurmaId]                   = useState('')
    const [professorOrientadorId, setProfessorOrientadorId] = useState('')
    const [alunos, setAlunos]                     = useState<UserResponse[]>([])
    const [turmas, setTurmas]                     = useState<Turma[]>([])
    const [professores, setProfessores]           = useState<UserResponse[]>([])

    // aluno — input temporário até /v1/professores existir
    const [professorIdAluno, setProfessorIdAluno] = useState('')

    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState<string | null>(null)

    useEffect(() => {
        if (!open || role !== 'PROFESSOR') return

        async function loadSelects() {
            try {
                const [alunosPage, turmasPage, usersPage] = await Promise.all([
                    listAlunos({ active: true }),
                    listTurmas(),
                    listUsers(),
                ])
                setAlunos(alunosPage.content)
                setTurmas(turmasPage.content)

                const profs = usersPage.content.filter(u => u.role === 'PROFESSOR')
                setProfessores(profs)

                // pré-seleciona o professor logado pelo cardNumber
                const me = profs.find(p => p.cardNumber === user?.cardNumber)
                if (me) setProfessorOrientadorId(String(me.id))
            } catch {
                // falha silenciosa — selects ficam vazios
            }
        }
        loadSelects()
    }, [open, role, user?.cardNumber])

    function reset() {
        setData('')
        setDataConclusao('')
        setProntuario('')
        setNomePaciente('')
        setObservacoes('')
        setStatus('PENDENTE')
        setAlunoId('')
        setTurmaId('')
        setProfessorOrientadorId('')
        setProfessorIdAluno('')
        setError(null)
    }

    function handleClose() {
        reset()
        onClose()
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            let result: AtividadeResponseDTO

            if (role === 'PROFESSOR') {
                result = await createAtividadeProfessor({
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                    status,
                    alunoId: Number(alunoId),
                    professorOrientadorId: Number(professorOrientadorId),
                    turmaId: Number(turmaId),
                })
            } else {
                result = await createAtividadeAluno({
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                    status,
                    professorOrientadorId: Number(professorIdAluno),
                })
            }

            onSave(result)
            handleClose()
        } catch (err: any) {
            setError(err?.message ?? 'Erro ao criar atividade.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div className="absolute inset-0 bg-content-primary/40 backdrop-blur-sm" />

            <div
                className={cn(
                    'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto',
                    'bg-surface-default border border-border-subtle rounded-xl shadow-md',
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle sticky top-0 bg-surface-default">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Nova Atividade</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">
                            Preencha os dados da atividade clínica
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

                    {/* Campos professor */}
                    {role === 'PROFESSOR' && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Aluno <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={alunoId}
                                    onChange={e => setAlunoId(e.target.value)}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        'hover:border-border-default focus:border-teal-400',
                                    )}
                                >
                                    <option value="">Selecione o aluno</option>
                                    {alunos.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Turma <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={turmaId}
                                    onChange={e => setTurmaId(e.target.value)}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        'hover:border-border-default focus:border-teal-400',
                                    )}
                                >
                                    <option value="">Selecione a turma</option>
                                    {turmas.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} — {t.disciplina}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Professor orientador <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={professorOrientadorId}
                                    onChange={e => setProfessorOrientadorId(e.target.value)}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        'hover:border-border-default focus:border-teal-400',
                                    )}
                                >
                                    <option value="">Selecione o professor</option>
                                    {professores.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Campos aluno */}
                    {role === 'ALUNO' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                ID do professor orientador <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                placeholder="Ex: 42"
                                value={professorIdAluno}
                                onChange={e => setProfessorIdAluno(e.target.value)}
                                required
                                min={1}
                            />
                            <p className="text-[11px] text-content-tertiary">
                                Seleção por nome disponível em breve
                            </p>
                        </div>
                    )}

                    {/* Campos comuns */}
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Data *"
                            type="date"
                            value={data}
                            onChange={e => setData(e.target.value)}
                            required
                        />
                        <Input
                            label="Data de conclusão"
                            type="date"
                            value={dataConclusao}
                            onChange={e => setDataConclusao(e.target.value)}
                        />
                    </div>

                    <Input
                        label="Prontuário *"
                        placeholder="Ex: ABC123"
                        value={prontuario}
                        onChange={e => setProntuario(e.target.value)}
                        required
                        maxLength={20}
                    />

                    <Input
                        label="Nome do paciente"
                        placeholder="Ex: João Silva"
                        value={nomePaciente}
                        onChange={e => setNomePaciente(e.target.value)}
                        maxLength={150}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                            Observações
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Anotações sobre o procedimento..."
                            value={observacoes}
                            onChange={e => setObservacoes(e.target.value)}
                            className={cn(
                                'font-sans text-sm text-content-primary bg-surface-default',
                                'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5 w-full outline-none resize-none',
                                'placeholder:text-content-tertiary transition-[border-color,box-shadow] duration-150',
                                'hover:border-border-default focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(31,163,163,0.12)]',
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as AtividadeStatus)}
                            className={cn(
                                'font-sans text-sm text-content-primary bg-surface-default',
                                'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                'outline-none transition-[border-color] duration-150',
                                'hover:border-border-default focus:border-teal-400',
                            )}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={loading}>
                            Criar atividade
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
