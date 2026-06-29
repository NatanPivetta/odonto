'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { AtividadeResponseDTO, AtividadeStatus, TipoAtividade, UserResponse } from '@/types'
import { TIPO_ATIVIDADE_OPTIONS } from '@/types'
import type { Turma } from '@/types'
import { createAtividadeProfessor, createAtividadeAluno } from '@/lib/services/atividades'
import { listAlunos } from '@/lib/services/users'
import { listTurmas, listTurmasDoAluno } from '@/lib/services/turmas'
import { listProfessores } from '@/lib/services/professores'
import { useAuth } from '@/lib/auth'
import ComboboxSelect from '@/components/ui/ComboboxSelect'

interface NewActivityModalProps {
    open: boolean
    onClose: () => void
    onSave: (atividade: AtividadeResponseDTO) => void
    role: 'PROFESSOR' | 'ALUNO'
    atividadePaiId?: number
    parentAtividade?: AtividadeResponseDTO
}

const STATUS_OPTIONS: { value: AtividadeStatus; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
]

export default function NewActivityModal({
    open, onClose, onSave, role, atividadePaiId, parentAtividade,
}: NewActivityModalProps) {
    const { user } = useAuth()

    const [data, setData]                 = useState('')
    const [dataConclusao, setDataConclusao] = useState('')
    const [prontuario, setProntuario]     = useState('')
    const [nomePaciente, setNomePaciente] = useState('')
    const [observacoes, setObservacoes]   = useState('')
    const [status, setStatus]             = useState<AtividadeStatus>('PENDENTE')
    const [tipo, setTipo]                 = useState<TipoAtividade | ''>('')
    const [tipoDescricao, setTipoDescricao] = useState('')

    const [alunoId, setAlunoId]                             = useState('')
    const [turmaId, setTurmaId]                             = useState('')
    const [professorOrientadorId, setProfessorOrientadorId] = useState('')
    const [professorTutorId, setProfessorTutorId]           = useState('')
    const [alunos, setAlunos]                               = useState<UserResponse[]>([])
    const [turmas, setTurmas]                               = useState<Turma[]>([])
    const [professores, setProfessores]                     = useState<UserResponse[]>([])

    const [professorIdAluno, setProfessorIdAluno] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        if (!open) return

        // Pré-seleciona campos da atividade pai
        if (parentAtividade) {
            if (parentAtividade.nomePaciente) setNomePaciente(parentAtividade.nomePaciente)
            if (role === 'PROFESSOR') {
                setAlunoId(String(parentAtividade.aluno.id))
                setAlunos([parentAtividade.aluno])
                setTurmaId(String(parentAtividade.turma.id))
            }
        }

        // Carrega professores para todos os roles — falha independente dos outros selects
        listProfessores()
            .then(page => {
                const profs = page.content
                setProfessores(profs)
                if (role === 'PROFESSOR') {
                    const me = profs.find(p => p.cardNumber === user?.cardNumber)
                    if (me) setProfessorOrientadorId(String(me.id))
                }
            })
            .catch(err => console.error('[NewActivityModal] listProfessores:', err))

        if (role === 'PROFESSOR' && !parentAtividade) {
            listAlunos({ active: true })
                .then(page => setAlunos(page.content))
                .catch(err => console.error('[NewActivityModal] listAlunos:', err))
        }
    }, [open, role, user?.cardNumber, parentAtividade])

    useEffect(() => {
        if (role !== 'PROFESSOR' || !alunoId) {
            setTurmas([])
            setTurmaId('')
            return
        }
        listTurmasDoAluno(Number(alunoId))
            .then(list => {
                setTurmas(list)
                if (list.length === 1) setTurmaId(String(list[0].id))
                else setTurmaId('')
            })
            .catch(err => console.error('[NewActivityModal] listTurmasDoAluno:', err))
    }, [alunoId, role])

    function reset() {
        setData('')
        setDataConclusao('')
        setProntuario('')
        setNomePaciente('')
        setObservacoes('')
        setStatus('PENDENTE')
        setTipo('')
        setTipoDescricao('')
        setAlunoId('')
        setTurmaId('')
        setProfessorOrientadorId('')
        setProfessorTutorId('')
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

            if (!tipo) {
                setError('Selecione o tipo de atividade.')
                return
            }
            if (role === 'PROFESSOR') {
                result = await createAtividadeProfessor({
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                    status,
                    tipo,
                    tipoDescricao: tipo === 'OUTROS' ? tipoDescricao || null : null,
                    alunoId: Number(alunoId),
                    professorOrientadorId: Number(professorOrientadorId),
                    professorTutorId: professorTutorId ? Number(professorTutorId) : null,
                    turmaId: Number(turmaId),
                    atividadePaiId: atividadePaiId ?? null,
                })
            } else {
                result = await createAtividadeAluno({
                    data,
                    dataConclusao: dataConclusao || null,
                    prontuario,
                    nomePaciente: nomePaciente || null,
                    observacoes: observacoes || null,
                    status,
                    tipo,
                    tipoDescricao: tipo === 'OUTROS' ? tipoDescricao || null : null,
                    professorOrientadorId: Number(professorIdAluno),
                    professorTutorId: professorTutorId ? Number(professorTutorId) : null,
                    atividadePaiId: atividadePaiId ?? null,
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

    const alunoInferido = role === 'PROFESSOR' && !!parentAtividade

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
                            {atividadePaiId
                                ? `Atividade filha de #${atividadePaiId}`
                                : 'Preencha os dados da atividade clínica'}
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
                                    disabled={alunoInferido}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        alunoInferido
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:border-border-default focus:border-teal-400',
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

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Professor tutor
                                </label>
                                <select
                                    value={professorTutorId}
                                    onChange={e => setProfessorTutorId(e.target.value)}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        'hover:border-border-default focus:border-teal-400',
                                    )}
                                >
                                    <option value="">Nenhum</option>
                                    {professores.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Campos aluno */}
                    {role === 'ALUNO' && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Professor orientador <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={professorIdAluno}
                                    onChange={e => setProfessorIdAluno(e.target.value)}
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

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
                                    Professor tutor
                                </label>
                                <select
                                    value={professorTutorId}
                                    onChange={e => setProfessorTutorId(e.target.value)}
                                    className={cn(
                                        'font-sans text-sm text-content-primary bg-surface-default',
                                        'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
                                        'outline-none transition-[border-color] duration-150',
                                        'hover:border-border-default focus:border-teal-400',
                                    )}
                                >
                                    <option value="">Nenhum</option>
                                    {professores.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
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
                            onChange={e => {
                                setDataConclusao(e.target.value)
                                if (e.target.value) setStatus('CONCLUIDA')
                            }}
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

                    <ComboboxSelect
                        label="Tipo de atividade"
                        required
                        value={tipo}
                        onChange={v => { setTipo(v as TipoAtividade | ''); setTipoDescricao('') }}
                        options={TIPO_ATIVIDADE_OPTIONS}
                        placeholder="Buscar tipo de atividade..."
                    />

                    {tipo === 'OUTROS' && (
                        <Input
                            label="Especifique o tipo *"
                            placeholder="Descreva o procedimento"
                            value={tipoDescricao}
                            onChange={e => setTipoDescricao(e.target.value)}
                            required
                            maxLength={255}
                        />
                    )}

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
