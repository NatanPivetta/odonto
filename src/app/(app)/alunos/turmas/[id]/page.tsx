'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    getTurmaById,
    addAlunoToTurma,
    removeAlunoFromTurma,
    addAlunosBulk,
    removeAlunosBulk,
} from '@/lib/services/turmas'
import { createUser, listAlunos } from '@/lib/services/users'
import { ApiError } from '@/lib/api'
import type { Turma, UserResponse } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCardNumber, normalizeCardNumber } from '@/lib/card-number'

// ── Helpers ────────────────────────────────────────────────────────

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold flex items-center justify-center shrink-0">
            {initials(name)}
        </div>
    )
}

// ── Modal de adicionar alunos (multi-select) ───────────────────────

type Tab = 'existente' | 'novo'

interface AdicionarAlunoModalProps {
    open: boolean
    onClose: () => void
    onAdded: (alunos: UserResponse[]) => void
    turmaId: number
    alunosJaMatriculados: number[]
}

function AdicionarAlunoModal({
    open, onClose, onAdded, turmaId, alunosJaMatriculados,
}: AdicionarAlunoModalProps) {
    const [tab, setTab] = useState<Tab>('existente')

    // ── aba existente ──────────────────────────────────────────────
    const [alunos, setAlunos]               = useState<UserResponse[]>([])
    const [loadingAlunos, setLoadingAlunos] = useState(false)
    const [busca, setBusca]                 = useState('')
    const [selecionados, setSelecionados]   = useState<Set<number>>(new Set())
    const [adicionando, setAdicionando]     = useState(false)
    const [erroAba, setErroAba]             = useState<string | null>(null)

    // ── aba novo ──────────────────────────────────────────────────
    const [name, setName]         = useState('')
    const [email, setEmail]       = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [password, setPassword] = useState('')
    const [criando, setCriando]   = useState(false)
    const [erroNovo, setErroNovo] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        setLoadingAlunos(true)
        setErroAba(null)
        listAlunos({ active: true })
            .then((page) => setAlunos(page.content))
            .catch(() => setErroAba('Não foi possível carregar os alunos.'))
            .finally(() => setLoadingAlunos(false))
    }, [open])

    function resetAll() {
        setTab('existente')
        setBusca('')
        setSelecionados(new Set())
        setErroAba(null)
        setName(''); setEmail(''); setCardNumber(''); setPassword('')
        setErroNovo(null)
    }

    function handleClose() { resetAll(); onClose() }

    const disponiveis = useMemo(() => {
        const q = busca.toLowerCase()
        return alunos.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                a.cardNumber.includes(q),
        )
    }, [alunos, busca])

    function toggleAluno(id: number) {
        setSelecionados((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function toggleAll() {
        const elegíveis = disponiveis.filter((a) => !alunosJaMatriculados.includes(a.id))
        const allSelected = elegíveis.every((a) => selecionados.has(a.id))
        setSelecionados(allSelected ? new Set() : new Set(elegíveis.map((a) => a.id)))
    }

    async function handleAdicionarSelecionados() {
        if (selecionados.size === 0) return
        setAdicionando(true)
        setErroAba(null)
        try {
            const ids = [...selecionados]
            if (ids.length === 1) {
                await addAlunoToTurma(turmaId, ids[0])
            } else {
                await addAlunosBulk(turmaId, ids)
            }
            const novos = alunos.filter((a) => selecionados.has(a.id))
            resetAll()
            onAdded(novos)
        } catch (err) {
            setErroAba(
                err instanceof ApiError && err.status === 409
                    ? err.message || 'Um ou mais alunos já estão matriculados nesta turma.'
                    : 'Erro ao matricular alunos.',
            )
        } finally {
            setAdicionando(false)
        }
    }

    async function handleCriarNovo(e: React.FormEvent) {
        e.preventDefault()
        setErroNovo(null)
        setCriando(true)
        try {
            const aluno = await createUser({ name, email, cardNumber: normalizeCardNumber(cardNumber), password, role: 'ALUNO' })
            await addAlunoToTurma(turmaId, aluno.id)
            resetAll()
            onAdded([aluno])
        } catch (err) {
            if (err instanceof ApiError) {
                setErroNovo(
                    err.status === 409 || err.message.includes('já cadastrado')
                        ? 'Já existe um aluno com este cartão ou e-mail.'
                        : err.message,
                )
            } else {
                setErroNovo('Erro ao cadastrar aluno.')
            }
        } finally {
            setCriando(false)
        }
    }

    if (!open) return null

    const elegíveisVisiveis = disponiveis.filter((a) => !alunosJaMatriculados.includes(a.id))
    const allVisiblesSelected = elegíveisVisiveis.length > 0 && elegíveisVisiveis.every((a) => selecionados.has(a.id))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="absolute inset-0 bg-content-primary/40 backdrop-blur-sm" />
            <div
                className={cn(
                    'relative z-10 w-full max-w-lg',
                    'bg-surface-default border border-border-subtle rounded-xl shadow-md',
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                    <div>
                        <h2 className="font-serif text-xl text-content-primary">Adicionar Alunos</h2>
                        <p className="text-xs text-content-tertiary mt-0.5">
                            Selecione um ou mais alunos, ou crie um novo cadastro
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border-subtle px-6">
                    {(['existente', 'novo'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                'py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors',
                                tab === t
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-content-tertiary hover:text-content-secondary',
                            )}
                        >
                            {t === 'existente' ? 'Alunos existentes' : 'Criar novo aluno'}
                        </button>
                    ))}
                </div>

                {/* Aba: existente */}
                {tab === 'existente' && (
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Buscar por nome, e-mail ou cartão..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="flex-1"
                            />
                            {elegíveisVisiveis.length > 0 && (
                                <button
                                    onClick={toggleAll}
                                    className="shrink-0 text-xs font-medium text-teal-600 hover:text-teal-700 whitespace-nowrap transition-colors"
                                >
                                    {allVisiblesSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                                </button>
                            )}
                        </div>

                        <div className="border border-border-subtle rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                            {loadingAlunos ? (
                                <div className="p-4 space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : disponiveis.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-content-tertiary">
                                    {busca ? 'Nenhum aluno encontrado.' : 'Nenhum aluno ativo cadastrado.'}
                                </p>
                            ) : (
                                disponiveis.map((aluno) => {
                                    const jaMatriculado = alunosJaMatriculados.includes(aluno.id)
                                    const checked = selecionados.has(aluno.id)
                                    return (
                                        <div
                                            key={aluno.id}
                                            onClick={() => !jaMatriculado && toggleAluno(aluno.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0 transition-colors',
                                                jaMatriculado
                                                    ? 'opacity-40 cursor-not-allowed bg-surface-subtle'
                                                    : checked
                                                        ? 'bg-teal-500/10 cursor-pointer'
                                                        : 'hover:bg-teal-500/5 cursor-pointer',
                                            )}
                                        >
                                            <Avatar name={aluno.name} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-content-primary truncate">{aluno.name}</p>
                                                <p className="text-xs text-content-tertiary truncate">{aluno.email}</p>
                                            </div>
                                            <span className="text-xs font-mono text-content-tertiary shrink-0">{aluno.cardNumber}</span>
                                            {jaMatriculado && (
                                                <span className="text-[10px] text-content-tertiary shrink-0">já matriculado</span>
                                            )}
                                            {checked && (
                                                <span className="text-teal-500 shrink-0">✓</span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {erroAba && <p className="text-xs text-red-600">{erroAba}</p>}

                        <div className="flex justify-between items-center pt-2 border-t border-border-subtle mt-1">
                            <span className="text-xs text-content-tertiary">
                                {selecionados.size > 0
                                    ? `${selecionados.size} aluno${selecionados.size > 1 ? 's' : ''} selecionado${selecionados.size > 1 ? 's' : ''}`
                                    : 'Nenhum aluno selecionado'}
                            </span>
                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                                <Button
                                    onClick={handleAdicionarSelecionados}
                                    disabled={selecionados.size === 0}
                                    loading={adicionando}
                                >
                                    Matricular{selecionados.size > 1 ? ` ${selecionados.size} alunos` : ' aluno'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Aba: novo */}
                {tab === 'novo' && (
                    <form onSubmit={handleCriarNovo} className="px-6 py-5 flex flex-col gap-4">
                        <Input
                            label="Nome completo"
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="E-mail institucional"
                            type="email"
                            placeholder="aluno@ufrgs.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    label="Número do cartão"
                                    placeholder="00000000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    label="Senha provisória"
                                    type="password"
                                    placeholder="mín. 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        {erroNovo && <p className="text-xs text-red-600">{erroNovo}</p>}

                        <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle mt-1">
                            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                            <Button type="submit" loading={criando}>Criar e matricular</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

// ── Tabela de alunos com seleção para remoção em lote ─────────────

function AlunosTable({
    alunos, turmaId, onRemoved,
}: {
    alunos: UserResponse[]
    turmaId: number
    onRemoved: (ids: number[]) => void
}) {
    const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
    const [removendo, setRemoving]        = useState(false)
    const [erroRemocao, setErroRemocao]   = useState<string | null>(null)

    const allSelected = alunos.length > 0 && alunos.every((a) => selecionados.has(a.id))

    function toggleAluno(id: number) {
        setSelecionados((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function toggleAll() {
        setSelecionados(allSelected ? new Set() : new Set(alunos.map((a) => a.id)))
    }

    async function handleRemoverSelecionados() {
        if (selecionados.size === 0) return
        setRemoving(true)
        setErroRemocao(null)
        try {
            const ids = [...selecionados]
            if (ids.length === 1) {
                await removeAlunoFromTurma(turmaId, ids[0])
            } else {
                await removeAlunosBulk(turmaId, ids)
            }
            setSelecionados(new Set())
            onRemoved(ids)
        } catch {
            setErroRemocao('Erro ao remover alunos. Tente novamente.')
        } finally {
            setRemoving(false)
        }
    }

    if (alunos.length === 0) {
        return (
            <div className="px-6 py-12 text-center">
                <p className="text-sm text-content-secondary mb-1">Nenhum aluno matriculado</p>
                <p className="text-xs text-content-tertiary">
                    Clique em &quot;Adicionar alunos&quot; para matricular o primeiro aluno nesta turma.
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Barra de ação em lote */}
            {selecionados.size > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-teal-500/10 border-b border-teal-500/20">
                    <span className="text-xs font-medium text-teal-700">
                        {selecionados.size} aluno{selecionados.size > 1 ? 's' : ''} selecionado{selecionados.size > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-3">
                        {erroRemocao && <span className="text-xs text-red-600">{erroRemocao}</span>}
                        <button
                            onClick={() => setSelecionados(new Set())}
                            className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <Button variant="danger" size="sm" loading={removendo} onClick={handleRemoverSelecionados}>
                            Remover {selecionados.size > 1 ? `${selecionados.size} alunos` : 'aluno'}
                        </Button>
                    </div>
                </div>
            )}

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-surface-subtle">
                        <th className="px-4 py-2.5 border-b border-border-subtle w-10">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded accent-teal-500"
                            />
                        </th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                            Aluno
                        </th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                            Cartão
                        </th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-content-tertiary border-b border-border-subtle">
                            Status
                        </th>
                        <th className="border-b border-border-subtle" />
                    </tr>
                </thead>
                <tbody>
                    {alunos.map((aluno) => {
                        const checked = selecionados.has(aluno.id)
                        return (
                            <tr
                                key={aluno.id}
                                className={cn(
                                    'transition-colors',
                                    checked ? 'bg-teal-500/10' : 'hover:bg-teal-500/5',
                                )}
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleAluno(aluno.id)}
                                        className="w-4 h-4 rounded accent-teal-500"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={aluno.name} />
                                        <div>
                                            <p className="text-sm font-medium text-content-primary">{aluno.name}</p>
                                            <p className="text-xs text-content-tertiary">{aluno.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-content-secondary font-mono">
                                    {aluno.cardNumber}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'inline-block px-2 py-0.5 rounded text-[11px] font-medium',
                                        aluno.active
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-surface-subtle text-content-tertiary',
                                    )}>
                                        {aluno.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => toggleAluno(aluno.id)}
                                        className="text-xs text-content-tertiary hover:text-red-500 transition-colors"
                                    >
                                        {checked ? 'Desmarcar' : 'Selecionar'}
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

// ── Página principal ───────────────────────────────────────────────

export default function TurmaDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const turmaId = Number(id)

    const [turma, setTurma]       = useState<Turma | null>(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchTurma = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setTurma(await getTurmaById(turmaId))
        } catch {
            setError('Não foi possível carregar a turma.')
        } finally {
            setLoading(false)
        }
    }, [turmaId])

    useEffect(() => { fetchTurma() }, [fetchTurma])

    function handleAlunosAdded(novos: UserResponse[]) {
        setTurma((prev) => prev ? { ...prev, alunos: [...prev.alunos, ...novos] } : prev)
        setModalOpen(false)
    }

    function handleAlunosRemoved(ids: number[]) {
        const removed = new Set(ids)
        setTurma((prev) =>
            prev ? { ...prev, alunos: prev.alunos.filter((a) => !removed.has(a.id)) } : prev,
        )
    }

    if (loading) {
        return (
            <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8 space-y-4">
                <div className="h-8 w-48 bg-surface-subtle rounded animate-pulse" />
                <div className="h-4 w-32 bg-surface-subtle rounded animate-pulse" />
                <div className="h-64 bg-surface-subtle rounded-xl animate-pulse mt-6" />
            </div>
        )
    }

    if (error || !turma) {
        return (
            <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">
                <p className="text-sm text-red-600">{error ?? 'Turma não encontrada.'}</p>
                <button onClick={() => router.back()} className="mt-3 text-sm text-teal-600 hover:underline">
                    ← Voltar
                </button>
            </div>
        )
    }

    const alunosIds = turma.alunos.map((a) => a.id)

    return (
        <div className="w-full max-w-full overflow-x-hidden px-4 py-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push('/alunos/turmas')}
                    className="text-xs text-content-tertiary hover:text-content-secondary mb-3 flex items-center gap-1 transition-colors"
                >
                    ← Turmas
                </button>
                <div className="flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0 max-w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-semibold tracking-wide uppercase">
                                {turma.disciplina}
                            </span>
                            <span className="text-xs text-content-tertiary">{turma.semester}</span>
                        </div>
                        <h1 className="font-serif text-3xl leading-tight text-content-primary">{turma.name}</h1>
                        {turma.alunos.length > 0 && (
                            <p className="text-sm text-content-tertiary mt-1">
                                {turma.alunos.length} aluno{turma.alunos.length > 1 ? 's' : ''} matriculado{turma.alunos.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Button onClick={() => setModalOpen(true)}>+ Adicionar alunos</Button>
                </div>
            </div>

            {/* Tabela */}
            <div className="max-w-full overflow-x-auto rounded-xl border border-border-subtle bg-surface-default shadow-xs">
                <AlunosTable
                    alunos={turma.alunos}
                    turmaId={turmaId}
                    onRemoved={handleAlunosRemoved}
                />
            </div>

            <AdicionarAlunoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={handleAlunosAdded}
                turmaId={turmaId}
                alunosJaMatriculados={alunosIds}
            />
        </div>
    )
}
