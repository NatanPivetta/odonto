'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AtividadeResponseDTO, Feedback } from '@/types'
import Badge, { statusConfig } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import NewActivityModal from '@/components/ui/NewActivityModal'
import EditActivityModal from '@/components/ui/EditActivityModal'
import { useAuth } from '@/lib/auth'
import { getAtividadeById, listAtividades, listMinhasAtividades, deleteAtividade, updateStatusAtividade } from '@/lib/services/atividades'
import { listFeedbacks, createFeedback, deleteFeedback } from '@/lib/services/feedbacks'

// ── Helpers ─────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

// ── Componentes de layout ────────────────────────────────────────────

function InfoCard({ title, children, className }: {
    title: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('bg-surface-default border border-border-subtle rounded-xl p-5', className)}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary mb-3">
                {title}
            </h3>
            <div className="flex flex-col gap-2.5">{children}</div>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4 text-sm">
            <span className="text-content-tertiary shrink-0">{label}</span>
            <span className="text-content-secondary text-right">{value}</span>
        </div>
    )
}

// ── Página ───────────────────────────────────────────────────────────

export default function AtividadeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const atividadeId = Number(params.id)
    const isProfessor = user?.role === 'PROFESSOR'

    const [atividade, setAtividade] = useState<AtividadeResponseDTO | null>(null)
    const [filhas, setFilhas]       = useState<AtividadeResponseDTO[]>([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState<string | null>(null)

    const [novaFilhaOpen, setNovaFilhaOpen] = useState(false)
    const [editOpen, setEditOpen]           = useState(false)
    const [concluding, setConcluding]       = useState(false)
    const [registeringAlta, setRegisteringAlta] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting]           = useState(false)
    const [deleteError, setDeleteError]     = useState<string | null>(null)

    const [feedbacks, setFeedbacks]               = useState<Feedback[]>([])
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false)
    const [newFeedback, setNewFeedback]           = useState('')
    const [savingFeedback, setSavingFeedback]     = useState(false)
    const [feedbackError, setFeedbackError]       = useState<string | null>(null)

    useEffect(() => {
        if (isNaN(atividadeId) || !user) return

        async function load() {
            try {
                setLoading(true)
                setError(null)

                const ativ = await getAtividadeById(atividadeId)
                setAtividade(ativ)

                if (user!.role === 'PROFESSOR') {
                    const filhasPage = await listAtividades({ atividadePaiId: atividadeId, size: 100 })
                    setFilhas(filhasPage.content.filter(a => a.atividadePaiId === atividadeId))
                } else {
                    const minhasPage = await listMinhasAtividades({ size: 200 })
                    setFilhas(minhasPage.content.filter(a => a.atividadePaiId === atividadeId))
                }
            } catch {
                setError('Atividade não encontrada ou sem permissão de acesso.')
            } finally {
                setLoading(false)
            }

            // feedbacks carregam independente para não bloquear a página
            setLoadingFeedbacks(true)
            listFeedbacks(atividadeId)
                .then(data => setFeedbacks(data))
                .catch(err => console.error('[AtividadeDetail] listFeedbacks:', err))
                .finally(() => setLoadingFeedbacks(false))
        }
        load()
    }, [atividadeId, user])

    function handleNovaFilha(nova: AtividadeResponseDTO) {
        setFilhas(prev => [nova, ...prev])
    }

    function handleSaved(updated: AtividadeResponseDTO) {
        setAtividade(updated)
    }

    async function handleConcluir() {
        if (!atividade) return
        setConcluding(true)
        try {
            const updated = await updateStatusAtividade(atividade.id, 'CONCLUIDA')
            setAtividade(updated)
        } catch (err: any) {
            setDeleteError(err?.message ?? 'Erro ao concluir atividade.')
        } finally {
            setConcluding(false)
        }
    }

    async function handleRegistrarAlta() {
        if (!atividade) return
        setRegisteringAlta(true)
        try {
            const updated = await updateStatusAtividade(atividade.id, 'ALTA')
            setAtividade(updated)
        } catch (err: any) {
            setDeleteError(err?.message ?? 'Erro ao registrar alta.')
        } finally {
            setRegisteringAlta(false)
        }
    }

    async function handleDelete() {
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteAtividade(atividadeId)
            router.push('/atividades')
        } catch (err: any) {
            setDeleteError(err?.message ?? 'Erro ao excluir atividade.')
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    async function handleAddFeedback() {
        if (!newFeedback.trim()) return
        setSavingFeedback(true)
        setFeedbackError(null)
        try {
            const fb = await createFeedback(atividadeId, newFeedback.trim())
            setFeedbacks(prev => [...prev, fb])
            setNewFeedback('')
        } catch (err: any) {
            setFeedbackError(err?.message ?? 'Erro ao adicionar feedback.')
        } finally {
            setSavingFeedback(false)
        }
    }

    async function handleDeleteFeedback(feedbackId: number) {
        try {
            await deleteFeedback(atividadeId, feedbackId)
            setFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
        } catch (err: any) {
            console.error('[AtividadeDetail] deleteFeedback:', err)
        }
    }

    // ── Loading / erro ───────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex w-full max-w-full items-center justify-center overflow-x-hidden px-4 py-20 text-sm text-content-secondary md:p-8">
                Carregando atividade...
            </div>
        )
    }

    if (error || !atividade) {
        return (
            <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
                    {error ?? 'Atividade não encontrada.'}
                </div>
            </div>
        )
    }

    const { variant, label } = statusConfig[atividade.status]

    return (
        <div className="mx-auto w-full max-w-4xl overflow-x-hidden px-4 py-6 md:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-content-tertiary mb-6">
                <button
                    onClick={() => router.push('/atividades')}
                    className="hover:text-content-primary transition-colors"
                >
                    ← Atividades
                </button>
                <span>/</span>
                <span className="text-content-primary font-medium">#{atividade.id}</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 max-w-full">
                    <p className="text-sm text-content-secondary mb-1">Gestão</p>
                    <h1 className="font-serif text-3xl leading-tight text-content-primary">
                        {atividade.nomePaciente ?? 'Paciente não informado'}
                    </h1>
                    <p className="text-sm text-content-tertiary font-mono mt-1">{atividade.prontuario}</p>
                    {atividade.atividadePaiId && (
                        <p className="text-xs text-content-tertiary mt-2">
                            Atividade filha de{' '}
                            <button
                                onClick={() => router.push(`/atividades/${atividade.atividadePaiId}`)}
                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                #{atividade.atividadePaiId}
                            </button>
                        </p>
                    )}
                </div>

                {/* Ações */}
                <div className="flex max-w-full flex-col items-start gap-2 md:shrink-0 md:items-end">
                    <Badge variant={variant} dot>{label}</Badge>

                    <div className="flex max-w-full flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
                            Editar
                        </Button>

                        {atividade.status !== 'CONCLUIDA' && atividade.status !== 'ALTA' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                loading={concluding}
                                onClick={handleConcluir}
                            >
                                Concluir
                            </Button>
                        )}

                        {isProfessor && atividade.status === 'CONCLUIDA' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                loading={registeringAlta}
                                onClick={handleRegistrarAlta}
                            >
                                Registrar alta
                            </Button>
                        )}

                        {isProfessor && !confirmDelete && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => { setDeleteError(null); setConfirmDelete(true) }}
                            >
                                Excluir
                            </Button>
                        )}

                        {isProfessor && confirmDelete && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-red-600 whitespace-nowrap">Confirmar exclusão?</span>
                                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                                    Sim
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                                    Não
                                </Button>
                            </div>
                        )}
                    </div>

                    {deleteError && (
                        <p className="text-xs text-red-600">{deleteError}</p>
                    )}
                </div>
            </div>

            {/* Info grid */}
            <div className="mb-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard title="Pessoas envolvidas">
                    {isProfessor && <InfoRow label="Aluno" value={atividade.aluno.name} />}
                    <InfoRow label="Prof. orientador" value={atividade.professorOrientador.name} />
                    {atividade.professorTutor && (
                        <InfoRow label="Prof. tutor" value={atividade.professorTutor.name} />
                    )}
                    <InfoRow
                        label="Turma"
                        value={`${atividade.turma.name} — ${atividade.turma.codigoTurma} — ${atividade.turma.disciplinaLabel}`}
                    />
                </InfoCard>

                <InfoCard title="Datas">
                    <InfoRow label="Data" value={fmtDate(atividade.data)} />
                    <InfoRow
                        label="Conclusão"
                        value={atividade.dataConclusao ? fmtDate(atividade.dataConclusao) : '—'}
                    />
                    <InfoRow
                        label="Registrado em"
                        value={new Date(atividade.createdAt).toLocaleDateString('pt-BR')}
                    />
                </InfoCard>
            </div>

            {atividade.observacoes && (
                <InfoCard title="Observações" className="mb-4">
                    <p className="text-sm text-content-secondary whitespace-pre-wrap">{atividade.observacoes}</p>
                </InfoCard>
            )}

            {/* Atividades filhas */}
            <div className="mt-8">
                <div className="mb-4 flex min-w-0 flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="font-serif text-xl text-content-primary">
                        Atividades filhas
                        {filhas.length > 0 && (
                            <span className="ml-2 text-base font-sans text-content-tertiary">
                                ({filhas.length})
                            </span>
                        )}
                    </h2>
                    <Button variant="secondary" size="sm" onClick={() => setNovaFilhaOpen(true)}>
                        + Nova atividade filha
                    </Button>
                </div>

                {filhas.length === 0 ? (
                    <p className="text-sm text-content-tertiary py-4">
                        Nenhuma atividade filha registrada.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filhas.map(f => {
                            const fc = statusConfig[f.status]
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => router.push(`/atividades/${f.id}`)}
                                    className={cn(
                                        'w-full text-left bg-surface-default border border-border-subtle rounded-xl p-4',
                                        'hover:border-border-default hover:shadow-sm transition-all duration-150',
                                        'flex items-center justify-between gap-4',
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-content-primary truncate">
                                            {f.nomePaciente ?? 'Paciente não informado'}
                                        </p>
                                        <p className="text-xs text-content-tertiary font-mono mt-0.5">
                                            {f.prontuario} · {fmtDate(f.data)}
                                        </p>
                                    </div>
                                    <Badge variant={fc.variant} dot>{fc.label}</Badge>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Feedbacks */}
            <div className="mt-8">
                <h2 className="font-serif text-xl text-content-primary mb-4">
                    Feedbacks
                    {feedbacks.length > 0 && (
                        <span className="ml-2 text-base font-sans text-content-tertiary">
                            ({feedbacks.length})
                        </span>
                    )}
                </h2>

                <div className="flex flex-col gap-3">
                    {loadingFeedbacks ? (
                        <p className="text-sm text-content-tertiary">Carregando feedbacks...</p>
                    ) : feedbacks.length === 0 ? (
                        <p className="text-sm text-content-tertiary italic">
                            Nenhum feedback registrado ainda.
                        </p>
                    ) : (
                        feedbacks.map(fb => (
                            <div
                                key={fb.id}
                                className="bg-surface-default border border-border-subtle rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <p className="text-xs text-content-tertiary">
                                        <span className="font-medium text-content-secondary">
                                            {fb.professor.name}
                                        </span>
                                        {' · '}
                                        {new Date(fb.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                    {isProfessor && (
                                        <button
                                            onClick={() => handleDeleteFeedback(fb.id)}
                                            className="text-xs text-content-tertiary hover:text-red-500 transition-colors shrink-0"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-content-secondary whitespace-pre-wrap">
                                    {fb.texto}
                                </p>
                            </div>
                        ))
                    )}

                    {/* Input de novo feedback — professor only */}
                    {isProfessor && (
                        <div className="bg-surface-default border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
                            <textarea
                                rows={3}
                                placeholder="Adicionar feedback..."
                                value={newFeedback}
                                onChange={e => setNewFeedback(e.target.value.slice(0, 1000))}
                                className={cn(
                                    'font-sans text-sm text-content-primary bg-surface-default',
                                    'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5 w-full outline-none resize-none',
                                    'placeholder:text-content-tertiary transition-[border-color,box-shadow] duration-150',
                                    'hover:border-border-default focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(31,163,163,0.12)]',
                                )}
                            />
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    'text-xs tabular-nums',
                                    newFeedback.length >= 1000 ? 'text-red-500' : 'text-content-tertiary',
                                )}>
                                    {newFeedback.length}/1000
                                </span>
                                <Button
                                    size="sm"
                                    onClick={handleAddFeedback}
                                    loading={savingFeedback}
                                    disabled={!newFeedback.trim()}
                                >
                                    Adicionar feedback
                                </Button>
                            </div>
                            {feedbackError && (
                                <p className="text-xs text-red-600">{feedbackError}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modais */}
            <NewActivityModal
                open={novaFilhaOpen}
                onClose={() => setNovaFilhaOpen(false)}
                onSave={handleNovaFilha}
                role={user?.role ?? 'ALUNO'}
                atividadePaiId={atividadeId}
                parentAtividade={atividade}
            />

            <EditActivityModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSaved={handleSaved}
                atividade={atividade}
                role={user?.role ?? 'ALUNO'}
            />
        </div>
    )
}
