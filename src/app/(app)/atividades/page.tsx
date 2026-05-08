'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AtividadeResponseDTO, AtividadeStatus } from '@/types'
import Badge, { statusConfig } from '@/components/ui/Badge'
import NewActivityModal from '@/components/ui/NewActivityModal'
import { useAuth } from '@/lib/auth'
import { listAtividades, listMinhasAtividades } from '@/lib/services/atividades'

// ── Ícones ─────────────────────────────────────────────────────────

function IconGrid() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        </svg>
    )
}

function IconList() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill="currentColor" />
            <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
        </svg>
    )
}

// ── Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, isProfessor, onClick }: {
    activity: AtividadeResponseDTO
    isProfessor: boolean
    onClick: () => void
}) {
    const { variant, label } = statusConfig[activity.status]

    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-surface-default border border-border-subtle',
                'rounded-xl shadow-xs p-5 cursor-pointer',
                'hover:shadow-sm hover:border-border-default',
                'transition-all duration-150 flex flex-col gap-3',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-content-primary leading-snug truncate">
                        {activity.nomePaciente ?? 'Paciente não informado'}
                    </h3>
                    <p className="text-xs text-content-tertiary mt-0.5 font-mono">
                        {activity.prontuario}
                    </p>
                </div>
                <Badge variant={variant} dot>{label}</Badge>
            </div>

            {activity.observacoes && (
                <p className="text-xs text-content-secondary line-clamp-2">
                    {activity.observacoes}
                </p>
            )}

            <div className="pt-3 border-t border-border-subtle flex flex-col gap-1 text-[11px]">
                {isProfessor && (
                    <div className="flex justify-between">
                        <span className="text-content-tertiary">Aluno</span>
                        <span className="text-content-secondary font-medium truncate max-w-[60%] text-right">
                            {activity.aluno.name}
                        </span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-content-tertiary">Professor</span>
                    <span className="text-content-secondary truncate max-w-[60%] text-right">
                        {activity.professorOrientador.name}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-content-tertiary">Turma</span>
                    <span className="text-content-secondary">{activity.turma.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-content-tertiary">Data</span>
                    <span className="text-content-secondary">
                        {new Date(activity.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ── Linha da tabela ─────────────────────────────────────────────────

function ActivityRow({ activity, isProfessor, onClick }: {
    activity: AtividadeResponseDTO
    isProfessor: boolean
    onClick: () => void
}) {
    const { variant, label } = statusConfig[activity.status]

    return (
        <tr onClick={onClick} className="cursor-pointer hover:bg-teal-50 transition-colors">
            <td className="px-4 py-3 text-sm font-medium text-content-primary">
                {activity.nomePaciente ?? '—'}
            </td>
            <td className="px-4 py-3 text-sm text-content-secondary font-mono">
                {activity.prontuario}
            </td>
            <td className="px-4 py-3">
                <Badge variant={variant} dot>{label}</Badge>
            </td>
            {isProfessor && (
                <td className="px-4 py-3 text-sm text-content-secondary">
                    {activity.aluno.name}
                </td>
            )}
            <td className="px-4 py-3 text-sm text-content-secondary">
                {activity.professorOrientador.name}
            </td>
            <td className="px-4 py-3 text-sm text-content-tertiary">
                {activity.turma.name}
            </td>
            <td className="px-4 py-3 text-sm text-content-tertiary">
                {new Date(activity.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </td>
        </tr>
    )
}

// ── Botão nova atividade ────────────────────────────────────────────

function NewActivityCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left',
                'bg-teal-50 border-2 border-dashed border-teal-200',
                'rounded-xl p-5 cursor-pointer',
                'hover:bg-teal-100 hover:border-teal-300',
                'transition-all duration-150 group',
            )}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-teal-500 text-white flex items-center justify-center text-lg font-light group-hover:scale-110 transition-transform">
                    +
                </div>
                <div>
                    <p className="text-sm font-semibold text-teal-700">Nova atividade</p>
                    <p className="text-xs text-teal-600/70">Clique para registrar uma atividade clínica</p>
                </div>
            </div>
        </button>
    )
}

// ── Conteúdo principal (usa useSearchParams) ────────────────────────

function AtividadesContent() {
    const [view, setView]           = useState<'cards' | 'lista'>('cards')
    const [modalOpen, setModalOpen] = useState(false)
    const [atividades, setAtividades] = useState<AtividadeResponseDTO[]>([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState<string | null>(null)

    const { user } = useAuth()
    const isProfessor = user?.role === 'PROFESSOR'

    const searchParams = useSearchParams()
    const statusFilter = searchParams.get('status') as AtividadeStatus | null

    useEffect(() => {
        if (!user) return
        const currentUser = user

        async function load() {
            try {
                setLoading(true)
                setError(null)
                const page = currentUser.role === 'PROFESSOR'
                    ? await listAtividades()
                    : await listMinhasAtividades()
                setAtividades(page.content)
            } catch {
                setError('Não foi possível carregar as atividades. Verifique sua conexão.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const displayed = statusFilter
        ? atividades.filter(a => a.status === statusFilter)
        : atividades

    function handleSave(nova: AtividadeResponseDTO) {
        setAtividades(prev => [nova, ...prev])
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-sm text-content-secondary mb-1">Gestão</p>
                    <h1 className="font-serif text-3xl text-content-primary">Atividades</h1>
                </div>

                <div className="flex items-center gap-1 bg-surface-subtle rounded-lg p-1">
                    <button
                        onClick={() => setView('cards')}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            view === 'cards'
                                ? 'bg-surface-default text-content-primary shadow-xs'
                                : 'text-content-tertiary hover:text-content-secondary',
                        )}
                    >
                        <IconGrid /> Cards
                    </button>
                    <button
                        onClick={() => setView('lista')}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            view === 'lista'
                                ? 'bg-surface-default text-content-primary shadow-xs'
                                : 'text-content-tertiary hover:text-content-secondary',
                        )}
                    >
                        <IconList /> Lista
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20 text-content-secondary text-sm">
                    Carregando atividades...
                </div>
            )}

            {/* Erro */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Cards */}
            {!loading && !error && view === 'cards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <NewActivityCard onClick={() => setModalOpen(true)} />
                    {displayed.length === 0 && (
                        <p className="col-span-full text-sm text-content-tertiary py-4">
                            Nenhuma atividade encontrada.
                        </p>
                    )}
                    {displayed.map(a => (
                        <ActivityCard key={a.id} activity={a} isProfessor={isProfessor} onClick={() => {}} />
                    ))}
                </div>
            )}

            {/* Lista */}
            {!loading && !error && view === 'lista' && (
                <div className="bg-surface-default border border-border-subtle rounded-xl overflow-hidden shadow-xs">
                    <div className="px-4 py-3 border-b border-border-subtle">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors"
                        >
                            <span className="w-5 h-5 rounded bg-teal-500 text-white flex items-center justify-center text-base leading-none">+</span>
                            Nova atividade
                        </button>
                    </div>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface-subtle">
                                {['Paciente', 'Prontuário', 'Status', ...(isProfessor ? ['Aluno'] : []), 'Professor', 'Turma', 'Data'].map(col => (
                                    <th key={col} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.length === 0 && (
                                <tr>
                                    <td colSpan={isProfessor ? 7 : 6} className="px-4 py-8 text-center text-sm text-content-tertiary">
                                        Nenhuma atividade encontrada.
                                    </td>
                                </tr>
                            )}
                            {displayed.map(a => (
                                <ActivityRow key={a.id} activity={a} isProfessor={isProfessor} onClick={() => {}} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NewActivityModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                role={user?.role ?? 'ALUNO'}
            />
        </div>
    )
}

// ── Página exportada com Suspense (requerido pelo useSearchParams) ──

export default function AtividadesPage() {
    return (
        <Suspense fallback={null}>
            <AtividadesContent />
        </Suspense>
    )
}
