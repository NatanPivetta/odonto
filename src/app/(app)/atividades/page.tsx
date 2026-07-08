'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AtividadeResponseDTO, AtividadeStatus, TipoAtividade, Turma, UserResponse } from '@/types'
import { TIPO_ATIVIDADE_OPTIONS } from '@/types'
import Badge, { statusConfig } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ComboboxSelect from '@/components/ui/ComboboxSelect'
import NewActivityModal from '@/components/ui/NewActivityModal'
import { useAuth } from '@/lib/auth'
import { listAtividades, listMinhasAtividades, updateStatusAtividade } from '@/lib/services/atividades'
import { listTurmas } from '@/lib/services/turmas'
import { listAlunos } from '@/lib/services/users'
import { listProfessores } from '@/lib/services/professores'

// ── Tipos ───────────────────────────────────────────────────────────

interface FilterState {
    status?: AtividadeStatus
    tipo?: TipoAtividade
    turmaId?: number
    alunoId?: number
    professorOrientadorId?: number
    professorTutorId?: number
}

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

function IconFilter() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1 3h13M3 7.5h9M5.5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

// ── Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, isProfessor, onClick, onConcluir }: {
    activity: AtividadeResponseDTO
    isProfessor: boolean
    onClick: () => void
    onConcluir: () => void
}) {
    const { variant, label } = statusConfig[activity.status]
    const canConcluir = activity.status !== 'CONCLUIDA' && activity.status !== 'ALTA'

    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-surface-default border border-border-subtle',
                'rounded-xl shadow-xs p-5 cursor-pointer',
                'hover:shadow-sm hover:border-border-default',
                'transition-all duration-150 flex min-w-0 max-w-full overflow-hidden flex-col gap-3',
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
                <div className="flex justify-between gap-3">
                    <span className="text-content-tertiary">Orientador</span>
                    <span className="text-content-secondary truncate max-w-[60%] text-right">
                        {activity.professorOrientador.name}
                    </span>
                </div>
                {activity.professorTutor && (
                    <div className="flex justify-between gap-3">
                        <span className="text-content-tertiary">Tutor</span>
                        <span className="text-content-secondary truncate max-w-[60%] text-right">
                            {activity.professorTutor.name}
                        </span>
                    </div>
                )}
                <div className="flex justify-between gap-3">
                    <span className="text-content-tertiary">Turma</span>
                    <span className="max-w-[60%] truncate text-right text-content-secondary">{activity.turma.name}</span>
                </div>
                <div className="flex justify-between gap-3">
                    <span className="text-content-tertiary">Data</span>
                    <span className="text-content-secondary">
                        {new Date(activity.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </div>

            {canConcluir && (
                <button
                    onClick={e => { e.stopPropagation(); onConcluir() }}
                    className={cn(
                        'mt-1 w-full text-center text-xs font-medium py-1.5 rounded-md',
                        'text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors',
                    )}
                >
                    Marcar como concluída
                </button>
            )}
        </div>
    )
}

// ── Linha da tabela ─────────────────────────────────────────────────

function ActivityRow({ activity, isProfessor, onClick, onConcluir }: {
    activity: AtividadeResponseDTO
    isProfessor: boolean
    onClick: () => void
    onConcluir: () => void
}) {
    const { variant, label } = statusConfig[activity.status]
    const canConcluir = activity.status !== 'CONCLUIDA' && activity.status !== 'ALTA'

    return (
        <tr onClick={onClick} className="cursor-pointer hover:bg-surface-subtle transition-colors">
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
                <span>{activity.professorOrientador.name}</span>
                {activity.professorTutor && (
                    <span className="block text-xs text-content-tertiary">
                        Tutor: {activity.professorTutor.name}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-sm text-content-tertiary">
                {activity.turma.name}
            </td>
            <td className="px-4 py-3 text-sm text-content-tertiary">
                {new Date(activity.data + 'T00:00:00').toLocaleDateString('pt-BR')}
            </td>
            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                {canConcluir && (
                    <button
                        onClick={onConcluir}
                        className="text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap transition-colors"
                    >
                        Concluir
                    </button>
                )}
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
                'w-full min-w-0 max-w-full overflow-hidden text-left',
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
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-teal-700">Nova atividade</p>
                    <p className="truncate text-xs text-teal-600/70">Clique para registrar uma atividade clínica</p>
                </div>
            </div>
        </button>
    )
}

// ── Painel de filtros ───────────────────────────────────────────────

const selectClass = cn(
    'font-sans text-sm text-content-primary bg-surface-default w-full',
    'border-[1.5px] border-border-subtle rounded-md px-3.5 py-2.5',
    'outline-none transition-[border-color] duration-150',
    'hover:border-border-default focus:border-teal-400',
)

const STATUS_FILTER_OPTIONS: { value: AtividadeStatus; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'ALTA', label: 'Paciente com alta' },
]

function FilterLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-[13px] font-medium text-content-secondary tracking-[0.01em]">
            {children}
        </label>
    )
}

function FilterPanel({
    open, onClose, onApply, currentFilters, isProfessor,
    turmas, alunos, professores,
}: {
    open: boolean
    onClose: () => void
    onApply: (f: FilterState) => void
    currentFilters: FilterState
    isProfessor: boolean
    turmas: Turma[]
    alunos: UserResponse[]
    professores: UserResponse[]
}) {
    const [local, setLocal] = useState<FilterState>(currentFilters)

    useEffect(() => {
        if (open) setLocal(currentFilters)
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!open) return null

    function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
        setLocal(prev => ({ ...prev, [key]: value }))
    }

    function handleApply() {
        onApply(local)
        onClose()
    }

    function handleClear() {
        setLocal({})
    }

    const activeCount = Object.values(currentFilters).filter(v => v !== undefined).length

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
                        <h2 className="font-serif text-xl text-content-primary">Filtrar atividades</h2>
                        {activeCount > 0 && (
                            <p className="text-xs text-teal-600 mt-0.5">{activeCount} filtro{activeCount > 1 ? 's' : ''} ativo{activeCount > 1 ? 's' : ''}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                    {/* Status — professor only */}
                    {isProfessor && (
                        <div className="flex flex-col gap-2.5">
                            <FilterLabel>Status</FilterLabel>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => set('status', undefined)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                        !local.status
                                            ? 'bg-teal-500 text-white border-teal-500'
                                            : 'text-content-secondary border-border-subtle hover:border-border-default',
                                    )}
                                >
                                    Todos
                                </button>
                                {STATUS_FILTER_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => set('status', local.status === opt.value ? undefined : opt.value)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                            local.status === opt.value
                                                ? 'bg-teal-500 text-white border-teal-500'
                                                : 'text-content-secondary border-border-subtle hover:border-border-default',
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tipo — ambos os roles */}
                    <div className="flex flex-col gap-1.5">
                        <ComboboxSelect
                            label="Tipo de atividade"
                            value={local.tipo ?? ''}
                            onChange={v => set('tipo', v as TipoAtividade || undefined)}
                            options={TIPO_ATIVIDADE_OPTIONS}
                            placeholder="Todos os tipos..."
                        />
                    </div>

                    {/* Filtros exclusivos do professor */}
                    {isProfessor && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <FilterLabel>Turma</FilterLabel>
                                    <select
                                        value={local.turmaId ?? ''}
                                        onChange={e => set('turmaId', e.target.value ? Number(e.target.value) : undefined)}
                                        className={selectClass}
                                    >
                                        <option value="">Todas as turmas</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <FilterLabel>Aluno</FilterLabel>
                                    <select
                                        value={local.alunoId ?? ''}
                                        onChange={e => set('alunoId', e.target.value ? Number(e.target.value) : undefined)}
                                        className={selectClass}
                                    >
                                        <option value="">Todos os alunos</option>
                                        {alunos.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <FilterLabel>Prof. orientador</FilterLabel>
                                    <select
                                        value={local.professorOrientadorId ?? ''}
                                        onChange={e => set('professorOrientadorId', e.target.value ? Number(e.target.value) : undefined)}
                                        className={selectClass}
                                    >
                                        <option value="">Todos</option>
                                        {professores.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <FilterLabel>Prof. tutor</FilterLabel>
                                    <select
                                        value={local.professorTutorId ?? ''}
                                        onChange={e => set('professorTutorId', e.target.value ? Number(e.target.value) : undefined)}
                                        className={selectClass}
                                    >
                                        <option value="">Todos</option>
                                        {professores.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                    <button
                        onClick={handleClear}
                        className="text-sm text-content-tertiary hover:text-content-primary transition-colors"
                    >
                        Limpar filtros
                    </button>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose}>Fechar</Button>
                        <Button onClick={handleApply}>Filtrar</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Conteúdo principal (usa useSearchParams) ────────────────────────

function AtividadesContent() {
    const [view, setView]           = useState<'cards' | 'lista'>('cards')
    const [modalOpen, setModalOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [atividades, setAtividades] = useState<AtividadeResponseDTO[]>([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState<string | null>(null)

    // Dados para o painel de filtros
    const [turmas, setTurmas]         = useState<Turma[]>([])
    const [alunos, setAlunos]         = useState<UserResponse[]>([])
    const [professores, setProfessores] = useState<UserResponse[]>([])

    const { user } = useAuth()
    const router = useRouter()
    const isProfessor = user?.role === 'PROFESSOR'

    const searchParams = useSearchParams()
    const statusFromUrl = searchParams.get('status') as AtividadeStatus | null

    const [filters, setFilters] = useState<FilterState>(() => ({
        status: statusFromUrl ?? undefined,
    }))

    const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length

    // Carrega dados dos filtros (professor only, uma vez)
    useEffect(() => {
        if (!user || !isProfessor) return
        Promise.all([
            listTurmas({ size: 100 }),
            listAlunos({ active: true }),
            listProfessores(),
        ]).then(([t, a, p]) => {
            setTurmas(t.content)
            setAlunos(a.content)
            setProfessores(p.content)
        }).catch(err => console.error('[AtividadesPage] filter data:', err))
    }, [user, isProfessor])

    // Carrega atividades sempre que filtros mudam
    useEffect(() => {
        if (!user) return
        const currentUser = user

        async function load() {
            try {
                setLoading(true)
                setError(null)
                const page = currentUser.role === 'PROFESSOR'
                    ? await listAtividades({
                        ...filters,
                        size: 100,
                    })
                    : await listMinhasAtividades({
                        tipo: filters.tipo,
                        size: 100,
                    })
                setAtividades(page.content)
            } catch {
                setError('Não foi possível carregar as atividades. Verifique sua conexão.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user, filters])

    function handleSave(nova: AtividadeResponseDTO) {
        setAtividades(prev => [nova, ...prev])
    }

    async function handleConcluir(id: number) {
        try {
            const updated = await updateStatusAtividade(id, 'CONCLUIDA')
            setAtividades(prev => prev.map(a => a.id === id ? updated : a))
        } catch {
            // falha silenciosa — usuário pode tentar no detalhe
        }
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">
            {/* Header */}
            <div className="mb-6 flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0 max-w-full">
                    <p className="text-sm text-content-secondary mb-1">Gestão</p>
                    <h1 className="font-serif text-3xl leading-tight text-content-primary">Atividades</h1>
                </div>

                <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 md:flex md:w-auto">
                    {/* Botão de filtros */}
                    <button
                        onClick={() => setFilterOpen(true)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            'border',
                            activeFilterCount > 0
                                ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                                : 'text-content-secondary border-border-subtle hover:border-border-default hover:text-content-primary',
                        )}
                    >
                        <IconFilter />
                        <span className="hidden min-[360px]:inline">Filtrar</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-0.5 bg-teal-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Toggle cards/lista */}
                    <div className="grid min-w-0 grid-cols-2 gap-1 rounded-lg bg-surface-subtle p-1 md:flex md:flex-none md:items-center">
                        <button
                            onClick={() => setView('cards')}
                            className={cn(
                                'flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all md:gap-1.5 md:px-3',
                                view === 'cards'
                                    ? 'bg-surface-default text-content-primary shadow-xs'
                                    : 'text-content-tertiary hover:text-content-secondary',
                            )}
                        >
                            <IconGrid /> <span className="truncate">Cards</span>
                        </button>
                        <button
                            onClick={() => setView('lista')}
                            className={cn(
                                'flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all md:gap-1.5 md:px-3',
                                view === 'lista'
                                    ? 'bg-surface-default text-content-primary shadow-xs'
                                    : 'text-content-tertiary hover:text-content-secondary',
                            )}
                        >
                            <IconList /> <span className="truncate">Lista</span>
                        </button>
                    </div>
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
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <NewActivityCard onClick={() => setModalOpen(true)} />
                    {atividades.length === 0 && (
                        <p className="col-span-full text-sm text-content-tertiary py-4">
                            Nenhuma atividade encontrada.
                        </p>
                    )}
                    {atividades.map(a => (
                        <ActivityCard
                            key={a.id}
                            activity={a}
                            isProfessor={isProfessor}
                            onClick={() => router.push(`/atividades/${a.id}`)}
                            onConcluir={() => handleConcluir(a.id)}
                        />
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
                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-[720px] border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface-subtle">
                                    {['Paciente', 'Prontuário', 'Status', ...(isProfessor ? ['Aluno'] : []), 'Professor', 'Turma', 'Data', ''].map((col, i) => (
                                        <th key={i} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {atividades.length === 0 && (
                                    <tr>
                                        <td colSpan={isProfessor ? 8 : 7} className="px-4 py-8 text-center text-sm text-content-tertiary">
                                            Nenhuma atividade encontrada.
                                        </td>
                                    </tr>
                                )}
                                {atividades.map(a => (
                                    <ActivityRow
                                        key={a.id}
                                        activity={a}
                                        isProfessor={isProfessor}
                                        onClick={() => router.push(`/atividades/${a.id}`)}
                                        onConcluir={() => handleConcluir(a.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal nova atividade */}
            <NewActivityModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                role={user?.role ?? 'ALUNO'}
            />

            {/* Painel de filtros */}
            <FilterPanel
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={setFilters}
                currentFilters={filters}
                isProfessor={isProfessor}
                turmas={turmas}
                alunos={alunos}
                professores={professores}
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
