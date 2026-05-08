'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { AtividadeResponseDTO, AtividadeStatus, UserResponse } from '@/types'
import {
    updateAtividadeProfessor,
    updateAtividadeAluno,
    updateStatusAtividade,
} from '@/lib/services/atividades'
import { listProfessores } from '@/lib/services/professores'

interface EditActivityModalProps {
    open: boolean
    onClose: () => void
    onSaved: (updated: AtividadeResponseDTO) => void
    atividade: AtividadeResponseDTO
    role: 'PROFESSOR' | 'ALUNO'
}

const STATUS_OPTIONS: { value: AtividadeStatus; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
]

const selectClass = cn(
    'font-sans text-sm text-content-primary bg-surface-default',
    'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
    'outline-none transition-[border-color] duration-150',
    'hover:border-border-default focus:border-teal-400',
)

export default function EditActivityModal({
    open, onClose, onSaved, atividade, role,
}: EditActivityModalProps) {
    const [data, setData]                     = useState('')
    const [dataConclusao, setDataConclusao]   = useState('')
    const [prontuario, setProntuario]         = useState('')
    const [nomePaciente, setNomePaciente]     = useState('')
    const [observacoes, setObservacoes]       = useState('')
    const [feedbackPrivado, setFeedbackPrivado] = useState('')
    const [professorOrientadorId, setProfessorOrientadorId] = useState('')
    const [status, setStatus]                 = useState<AtividadeStatus>('PENDENTE')
    const [professores, setProfessores]       = useState<UserResponse[]>([])

    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        if (!open) return

        setData(atividade.data)
        setDataConclusao(atividade.dataConclusao ?? '')
        setProntuario(atividade.prontuario)
        setNomePaciente(atividade.nomePaciente ?? '')
        setObservacoes(atividade.observacoes ?? '')
        setFeedbackPrivado(atividade.feedbackPrivado ?? '')
        setProfessorOrientadorId(String(atividade.professorOrientador.id))
        setStatus(atividade.status)
        setError(null)

        if (role === 'PROFESSOR') {
            listProfessores({ active: true })
                .then(page => setProfessores(page.content))
                .catch(err => console.error('[EditActivityModal] listProfessores:', err))
        }
    }, [open, atividade, role])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            let updated: AtividadeResponseDTO

            if (role === 'PROFESSOR') {
                updated = await updateAtividadeProfessor(atividade.id, {
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                    feedbackPrivado: feedbackPrivado || null,
                    professorOrientadorId: Number(professorOrientadorId),
                })
                if (status !== atividade.status) {
                    updated = await updateStatusAtividade(atividade.id, status)
                }
            } else {
                updated = await updateAtividadeAluno(atividade.id, {
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                })
            }

            onSaved(updated)
            onClose()
        } catch (err: any) {
            setError(err?.message ?? 'Erro ao salvar atividade.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-content-primary/40 backdrop-blur-sm" />

            <div
                className={cn(
                    'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto',
                    'bg-surface-default border border-border-subtle rounded-xl shadow-md',
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle sticky top-0 bg-surface-default">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Editar Atividade</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">
                            #{atividade.id} · {atividade.prontuario}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

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
                        value={prontuario}
                        onChange={e => setProntuario(e.target.value)}
                        required
                        maxLength={20}
                    />

                    <Input
                        label="Nome do paciente"
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

                    {/* Campos exclusivos do professor */}
                    {role === 'PROFESSOR' && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Feedback privado
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Visível apenas para professores"
                                    value={feedbackPrivado}
                                    onChange={e => setFeedbackPrivado(e.target.value)}
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
                                    Professor orientador <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={professorOrientadorId}
                                    onChange={e => setProfessorOrientadorId(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Selecione o professor</option>
                                    {professores.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as AtividadeStatus)}
                                    className={selectClass}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={loading}>
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
